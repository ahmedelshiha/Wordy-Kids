import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { audioService } from "@/lib/audioService";
import { enhancedAudioService } from "@/lib/enhancedAudioService";
import { AchievementTracker } from "@/lib/achievementTracker";
import { EnhancedAchievementTracker } from "@/lib/enhancedAchievementTracker";
import { EnhancedAchievementPopup } from "@/components/EnhancedAchievementPopup";
import { AchievementTeaser } from "@/components/AchievementTeaser";
import {
  DashboardWordGenerator,
  DashboardWordSession,
  UserProgress,
} from "@/lib/dashboardWordGenerator";
import { useVoiceSettings } from "@/hooks/use-voice-settings";

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

interface InteractiveDashboardWordCardProps {
  words: Word[];
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
  forgottenWordsCount?: number;
  rememberedWordsCount?: number;
  className?: string;
  onRequestNewWords?: () => void; // New prop to request fresh words
  onSessionProgress?: (stats: SessionStats) => void; // New prop to report session progress
  // Systematic word generation props
  dashboardSession?: DashboardWordSession | null;
  onGenerateNewSession?: () => void; // Function to generate new systematic session
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

export function InteractiveDashboardWordCard({
  words,
  onWordProgress,
  onQuickQuiz,
  onAdventure,
  onPracticeForgotten,
  dailyGoal,
  currentLevel,
  totalPoints,
  forgottenWordsCount = 0,
  rememberedWordsCount = 0,
  className,
  onRequestNewWords,
  onSessionProgress,
  dashboardSession,
  onGenerateNewSession,
}: InteractiveDashboardWordCardProps) {
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

  // Touch handlers with haptic feedback
  const handleTouchStart = (callback?: () => void) => {
    triggerHapticFeedback("light");
    if (callback) callback();
  };

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
          setShowHint(true);
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
  const [sessionWords, setSessionWords] = useState<any[]>([]);
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

  // Systematic progression state - DISABLED for clean UI
  // const [progressionInfo, setProgressionInfo] = useState({
  //   stage: "Foundation Building",
  //   description: "Mastering easy words from all categories",
  //   nextMilestone: 50,
  //   progress: 0
  // });

  // Progressive enhancement detection
  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Initialize session with systematic word generation
  useEffect(() => {
    if (words.length > 0 && sessionWords.length === 0) {
      const sessionWordSet = words.slice(0, SESSION_SIZE);
      setSessionWords(sessionWordSet);
      setCurrentWordIndex(0);
      setSessionStats({
        wordsCompleted: 0,
        wordsRemembered: 0,
        wordsForgotten: 0,
        accuracy: 0,
        sessionStartTime: Date.now(),
      });

      // Update progression info if dashboard session is available
      if (dashboardSession) {
        const wordsCompleted = rememberedWordsCount;
        // const progInfo = DashboardWordGenerator.getProgressionInfo(wordsCompleted);
        // setProgressionInfo(progInfo);

        console.log(`Systematic session started:`, {
          stage: dashboardSession.sessionInfo.progressionStage,
          difficulty: dashboardSession.sessionInfo.difficulty,
          categories: dashboardSession.sessionInfo.categoriesUsed,
          words: sessionWordSet.length,
        });
      } else {
        console.log(
          `Standard session started with ${sessionWordSet.length} words`,
        );
      }
    }
  }, [words, dashboardSession]);

  const currentWord = sessionWords[currentWordIndex] || null;
  const sessionProgress = Math.round(
    (sessionStats.wordsCompleted / SESSION_SIZE) * 100,
  );

  // Calculate daily progress percentage for the progress bar
  const dailyProgress = Math.round(
    (dailyGoal.completed / dailyGoal.target) * 100,
  );

  // Debug logging for session tracking
  useEffect(() => {
    console.log("Session Debug:", {
      currentWordIndex: currentWordIndex + 1,
      sessionSize: SESSION_SIZE,
      wordsCompleted: sessionStats.wordsCompleted,
      wordsRemembered: sessionStats.wordsRemembered,
      wordsForgotten: sessionStats.wordsForgotten,
      accuracy: sessionStats.accuracy,
      sessionProgress,
    });
  }, [sessionStats, currentWordIndex, sessionProgress]);

  // Reset card state when starting new session
  useEffect(() => {
    if (sessionWords.length > 0 && currentWordIndex >= sessionWords.length) {
      setCurrentWordIndex(0);
    }
  }, [sessionWords, currentWordIndex]);

  // Reset card state when word changes
  useEffect(() => {
    setShowWordName(false);
    setIsAnswered(false);
    setGuess("");
    setShowHint(false);
    setImageLoaded(false);
    setImageError(false);
    setIsTransitioning(true);

    // Reset transition state after brief delay
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [currentWordIndex]);

  const playPronunciation = () => {
    if (currentWord && !isPlaying) {
      triggerHapticFeedback("light"); // Light feedback for audio action
      setIsPlaying(true);
      enhancedAudioService.pronounceWord(currentWord.word, {
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
  };

  const checkSessionAchievements = (stats: SessionStats): Achievement[] => {
    const achievements: Achievement[] = [];
    const { wordsCompleted, wordsRemembered, accuracy } = stats;

    // Session completion achievements based on performance
    if (wordsCompleted === SESSION_SIZE) {
      if (accuracy === 100) {
        achievements.push({
          id: "perfect_session",
          title: "PERFECT SESSION!",
          description: `Amazing! You got all ${SESSION_SIZE} words correct!`,
          emoji: "🏆",
          unlocked: true,
        });
      } else if (accuracy >= 90) {
        achievements.push({
          id: "excellent_session",
          title: "EXCELLENT SESSION!",
          description: `Outstanding! ${accuracy}% accuracy on ${SESSION_SIZE} words!`,
          emoji: "⭐",
          unlocked: true,
        });
      } else if (accuracy >= 75) {
        achievements.push({
          id: "great_session",
          title: "GREAT SESSION!",
          description: `Well done! ${accuracy}% accuracy. Keep it up!`,
          emoji: "🎯",
          unlocked: true,
        });
      } else if (accuracy >= 50) {
        achievements.push({
          id: "good_effort",
          title: "GOOD EFFORT!",
          description: `Nice try! ${accuracy}% accuracy. Practice makes perfect!`,
          emoji: "💪",
          unlocked: true,
        });
      } else {
        achievements.push({
          id: "session_complete",
          title: "SESSION COMPLETE!",
          description: `You finished all ${SESSION_SIZE} words! Every attempt helps you learn!`,
          emoji: "🌟",
          unlocked: true,
        });
      }

      // Speed bonus
      const sessionTime = Date.now() - stats.sessionStartTime;
      const minutes = Math.round(sessionTime / 60000);
      if (minutes <= 5 && accuracy >= 80) {
        achievements.push({
          id: "speed_demon",
          title: "SPEED DEMON!",
          description: `Lightning fast! Completed in ${minutes} minutes with ${accuracy}% accuracy!`,
          emoji: "⚡",
          unlocked: true,
        });
      }

      // Streak achievements
      if (wordsRemembered >= 15) {
        achievements.push({
          id: "word_master",
          title: "WORD MASTER!",
          description: `Incredible! You remembered ${wordsRemembered} out of ${SESSION_SIZE} words!`,
          emoji: "🧠",
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
      triggerHapticFeedback("heavy"); // Strong feedback for positive action
    } else if (status === "needs_practice") {
      triggerHapticFeedback("medium"); // Medium feedback for learning action
    } else {
      triggerHapticFeedback("light"); // Light feedback for skip
    }

    console.log(`Word Action: ${currentWord.word} - ${status}`, {
      wordId: currentWord.id,
      sessionProgress: `${currentWordIndex + 1}/${SESSION_SIZE}`,
      sessionStats,
    });

    // Mark as answered immediately to prevent double-clicks
    setIsAnswered(true);

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

    // Report session progress to parent
    if (onSessionProgress) {
      onSessionProgress(newStats);
    }

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
      console.log(`Word progress callback completed for: ${currentWord.word}`);
      console.log(
        `Session progress: ${newStats.wordsCompleted}/${SESSION_SIZE}, Accuracy: ${newStats.accuracy}%`,
      );

      // Track journey achievements for word learning activity
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
        timeSpent: 1, // Assume 1 minute per word on average
      });

      // Track enhanced achievements with difficulty-based progression
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

      // Combine achievements from both systems
      const allNewAchievements = [
        ...newJourneyAchievements,
        ...enhancedAchievements,
      ];

      // Show enhanced achievements if any were unlocked
      if (allNewAchievements.length > 0) {
        setTimeout(() => {
          setJourneyAchievements(allNewAchievements);
        }, 1500); // Show after feedback animation
      }
    } catch (error) {
      console.error("Error in word progress callback:", error);
    }

    // Check if session is complete
    if (newStats.wordsCompleted >= SESSION_SIZE) {
      const achievements = checkSessionAchievements(newStats);
      setSessionAchievements(achievements);

      // Track session completion for journey achievements
      const sessionJourneyAchievements = AchievementTracker.trackActivity({
        type: "sessionComplete",
        accuracy: newStats.accuracy,
        timeSpent: Math.round(
          (Date.now() - newStats.sessionStartTime) / 1000 / 60,
        ), // Convert to minutes
        wordsLearned: newStats.wordsRemembered,
      });

      // Track enhanced session completion achievements
      const sessionTimeMinutes = Math.round(
        (Date.now() - newStats.sessionStartTime) / 1000 / 60,
      );
      const enhancedSessionAchievements =
        EnhancedAchievementTracker.trackActivity({
          type: "sessionComplete",
          sessionStats: {
            accuracy: newStats.accuracy,
            timeMinutes: sessionTimeMinutes,
            wordsCompleted: newStats.wordsCompleted,
          },
        });

      // Combine all session achievements
      const allSessionAchievements = [
        ...sessionJourneyAchievements,
        ...enhancedSessionAchievements,
      ];

      // Add all session achievements to the display queue
      if (allSessionAchievements.length > 0) {
        setTimeout(() => {
          setJourneyAchievements((prev) => [
            ...prev,
            ...allSessionAchievements,
          ]);
        }, 3000); // Show after session completion celebration
      }

      setShowSessionComplete(true);

      // Update progression info based on total words completed
      const totalWordsCompleted =
        rememberedWordsCount + newStats.wordsRemembered;
      // const updatedProgInfo = DashboardWordGenerator.getProgressionInfo(totalWordsCompleted);
      // setProgressionInfo(updatedProgInfo);

      console.log("Session completed!", {
        stats: newStats,
        achievements: achievements.map((a) => a.title),
        journeyAchievements: allSessionAchievements.length,
        totalWordsCompleted,
      });
      return;
    }

    // Auto-advance to next word after progress is recorded
    setTimeout(
      () => {
        advanceToNextWord();
      },
      status === "remembered" ? 1500 : 800,
    );
  };

  const advanceToNextWord = () => {
    console.log(`Advancing from word ${currentWordIndex + 1}/${SESSION_SIZE}`);

    // Start transition effect
    setIsTransitioning(true);

    // Brief delay for smooth transition
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

      // Simply move to next word in session
      const nextIndex = currentWordIndex + 1;

      if (nextIndex < SESSION_SIZE && nextIndex < sessionWords.length) {
        setCurrentWordIndex(nextIndex);
        console.log(
          `Advanced to word ${nextIndex + 1}/${SESSION_SIZE}: ${sessionWords[nextIndex]?.word}`,
        );
      } else {
        console.log("Reached end of session words");
        // This shouldn't happen as session completion is handled in handleWordAction
      }

      // End transition effect
      setTimeout(() => setIsTransitioning(false), 100);
    }, 300);
  };

  const startNewSession = () => {
    console.log("Starting new session...");

    // Reset all session state
    setShowSessionComplete(false);
    setSessionAchievements([]);
    setJourneyAchievements([]);
    setCurrentWordIndex(0);
    setIsAnswered(false);
    setFeedbackType(null);
    setCelebrationEffect(false);

    // Reset session stats
    setSessionStats({
      wordsCompleted: 0,
      wordsRemembered: 0,
      wordsForgotten: 0,
      accuracy: 0,
      sessionStartTime: Date.now(),
    });

    // Request new systematic session if available
    if (onGenerateNewSession) {
      console.log("Generating new systematic session...");
      onGenerateNewSession();
    } else if (onRequestNewWords) {
      // Fallback to regular word request
      onRequestNewWords();
    }

    // Clear current session words to trigger new session initialization
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

    // Fallback to emoji if no image URL
    if (currentWord?.emoji) {
      // Show feedback overlay if user has answered
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
            {/* Celebration background effect */}
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

            {/* Extra sparkles for success */}
            {feedbackType === "remembered" && (
              <>
                <motion.div
                  key={`feedback-sparkle-1-${currentWordIndex}`}
                  initial={{ opacity: 0, scale: 0, x: -20, y: -10 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: -30,
                    y: -20,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.2,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                  className="absolute text-yellow-300 text-sm"
                >
                  ✨
                </motion.div>
                <motion.div
                  key={`feedback-sparkle-2-${currentWordIndex}`}
                  initial={{ opacity: 0, scale: 0, x: 20, y: -10 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: 30,
                    y: -20,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                  className="absolute text-blue-300 text-xs"
                >
                  ⭐
                </motion.div>
              </>
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
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200/20 via-purple-200/20 to-pink-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-2 right-2 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            🔊
          </div>

          {/* Main emoji with enhanced animation */}
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

            {/* Sparkle effects on hover */}
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

    // Default placeholder
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-lg">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🖼️</div>
          <p className="text-lg">Picture coming soon!</p>
        </div>
      </div>
    );
  };

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
      aria-label="Interactive word learning card"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Today's Word Quest - Mobile Optimized Top Left */}
      <div className="mb-4 hidden">
        <Card className="bg-gradient-to-r from-educational-blue/10 to-educational-purple/10 border-educational-blue/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex items-center gap-1 md:gap-2">
                  <span className="text-lg md:text-2xl">
                    {(() => {
                      const wordsLearned = Math.max(
                        sessionStats.wordsRemembered,
                        rememberedWordsCount || 0,
                      );
                      const goal = dailyGoal.target;
                      const percentage = Math.round(
                        (wordsLearned / goal) * 100,
                      );

                      if (wordsLearned >= goal) {
                        if (wordsLearned >= goal * 2) return "⭐";
                        if (wordsLearned >= goal * 1.5) return "🚀";
                        return "🏆";
                      }
                      if (percentage >= 90) return "⭐";
                      if (percentage >= 75) return "🎯";
                      if (percentage >= 50) return "💪";
                      return "🌟";
                    })()}
                  </span>
                  <div>
                    <span className="text-xs md:text-sm font-bold text-slate-800">
                      Today's Word Quest
                    </span>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {(() => {
                        const wordsLearned = Math.max(
                          sessionStats.wordsRemembered,
                          rememberedWordsCount || 0,
                        );
                        const goal = dailyGoal.target;
                        const percentage = Math.round(
                          (wordsLearned / goal) * 100,
                        );

                        if (wordsLearned >= goal) {
                          if (wordsLearned >= goal * 2)
                            return "⭐ SUPERSTAR! Amazing effort!";
                          if (wordsLearned >= goal * 1.5)
                            return "🚀 Beyond awesome! Keep going!";
                          return "�� Goal achieved! You're incredible!";
                        }
                        if (percentage >= 90)
                          return "🌟 Almost there, superstar!";
                        if (percentage >= 75) return "🚀 You're doing great!";
                        if (percentage >= 50) return "💪 Keep going, champion!";
                        if (percentage >= 25) return "🌱 Nice start!";
                        return "🌟 Ready for an adventure?";
                      })()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <div className="text-right">
                  <div className="text-xs md:text-sm font-bold text-slate-800">
                    {Math.max(
                      sessionStats.wordsRemembered,
                      rememberedWordsCount || 0,
                    )}
                    /{dailyGoal.target}
                  </div>
                  <div className="text-xs text-slate-600">words</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Completion Modal */}
      {showSessionComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-1 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-3xl p-2 sm:p-8 max-w-xs sm:max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="text-3xl sm:text-6xl mb-1 sm:mb-4">🎉</div>
            <h2 className="text-lg sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">
              Session Complete!
            </h2>

            {/* Session Stats */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg sm:rounded-2xl p-2 sm:p-4 mb-2 sm:mb-6">
              <div className="grid grid-cols-3 gap-1 sm:gap-4 text-center">
                <div>
                  <div className="text-sm sm:text-2xl font-bold text-green-600">
                    {sessionStats.wordsRemembered}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Remembered
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

            {/* Achievements */}
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

            {/* Continue Button */}
            <button
              onClick={startNewSession}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-2 sm:py-4 px-3 sm:px-6 text-xs sm:text-base rounded-lg sm:rounded-2xl hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🚀 Start New Session
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
            {/* Today's Word Quest - Left Corner without container */}
            <div className="absolute top-2 left-2 md:top-3 md:left-3 z-20 mb-4 hidden">
              <div className="flex items-center gap-1 md:gap-2">
                <span className="text-sm md:text-base">
                  {(() => {
                    const wordsLearned = Math.max(
                      sessionStats.wordsRemembered,
                      rememberedWordsCount || 0,
                    );
                    const goal = dailyGoal.target;
                    const percentage = Math.round((wordsLearned / goal) * 100);

                    if (wordsLearned >= goal) {
                      if (wordsLearned >= goal * 2) return "⭐";
                      if (wordsLearned >= goal * 1.5) return "🚀";
                      return "🏆";
                    }
                    if (percentage >= 90) return "⭐";
                    if (percentage >= 75) return "🎯";
                    if (percentage >= 50) return "🌿";
                    return "🌟";
                  })()}
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    Today's Word Quest
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {(() => {
                      const wordsLearned = Math.max(
                        sessionStats.wordsRemembered,
                        rememberedWordsCount || 0,
                      );
                      const goal = dailyGoal.target;
                      const percentage = Math.round(
                        (wordsLearned / goal) * 100,
                      );

                      if (wordsLearned >= goal) {
                        if (wordsLearned >= goal * 2)
                          return "⭐ SUPERSTAR! Amazing effort!";
                        if (wordsLearned >= goal * 1.5)
                          return "🚀 Beyond awesome! Keep going!";
                        return "🎉 Goal achieved! You're incredible!";
                      }
                      if (percentage >= 90)
                        return "🌟 Almost there, superstar!";
                      if (percentage >= 75) return "🚀 You're doing great!";
                      if (percentage >= 50) return "💪 Keep going, champion!";
                      if (percentage >= 25) return "🌱 Nice start!";
                      return "🌟 Ready for an adventure?";
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Achievement Teaser - Motivational hints */}
            <div aria-live="polite" aria-label="Motivational messages">
              <AchievementTeaser className="mb-3" />
            </div>

            {/* Category and Progress Header */}
            <div className="text-center mb-4 sm:mb-6 md:mb-8 mt-4 sm:mt-6 md:mt-8">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                {/* Difficulty classification badge */}
                <Badge
                  className={cn(
                    "text-xs sm:text-sm px-2 sm:px-3 py-1",
                    currentWord.difficulty === "easy"
                      ? "bg-green-100 text-green-700 border-green-300"
                      : currentWord.difficulty === "medium"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                        : currentWord.difficulty === "hard"
                          ? "bg-red-100 text-red-700 border-red-300"
                          : "bg-gray-100 text-gray-700 border-gray-300",
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
                {/* Hidden: Word progress and Session progress badges */}
                <Badge
                  variant="outline"
                  className="text-xs sm:text-sm px-2 sm:px-3 py-1 bg-purple-50 text-purple-700 border-purple-300"
                >
                  {sessionStats.accuracy}% Accuracy
                </Badge>
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

                {/* State overlay for transitions */}
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
                {(() => {
                  const prompts = [
                    "🤔 What is this?",
                    "🎯 Can you guess?",
                    "🔍 What do you see?",
                    "✨ Name this object!",
                    "🧠 Think you know?",
                    "👀 Look closely...",
                    "🌟 What could this be?",
                    "🎪 Mystery object!",
                    "🎨 Identify this!",
                    "🚀 What's shown here?",
                  ];

                  // Use word index and some randomness for variety
                  const promptIndex =
                    (currentWordIndex + (currentWord?.id || 0)) %
                    prompts.length;
                  return prompts[promptIndex];
                })()}
              </motion.h1>
              <motion.p
                key={`desc-${currentWordIndex}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-xs sm:text-sm md:text-base text-gray-600 px-2"
                id="game-instructions"
              >
                {(() => {
                  const descriptions = [
                    "Look at the picture and guess the word!",
                    "Study the image and make your guess!",
                    "Take a close look and identify it!",
                    "Examine the picture carefully!",
                    "What word matches this image?",
                    "Use the visual clue to find the answer!",
                    "Let the picture guide your guess!",
                    "Connect the image to the right word!",
                  ];

                  const descIndex =
                    (currentWordIndex + (currentWord?.category?.length || 0)) %
                    descriptions.length;
                  return descriptions[descIndex];
                })()}
              </motion.p>
            </header>

            {/* Action Buttons Row - Mobile Optimized */}
            <div
              className="flex justify-center items-center gap-2 sm:gap-3 mb-3 sm:mb-4 px-2"
              role="toolbar"
              aria-label="Word learning controls"
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
                      handleActionWithFeedback(() => setShowHint(true), "light")
                    }
                    variant="outline"
                    size="sm"
                    className="px-3 py-2 text-xs sm:text-sm rounded-xl transition-all duration-300 min-h-[44px] touch-manipulation group relative overflow-hidden bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 border-2 border-yellow-200 hover:border-yellow-300 shadow-md hover:shadow-lg"
                    aria-label="Show hint"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/0 via-yellow-200/50 to-yellow-200/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
                    <Lightbulb className="w-4 h-4 mr-1 group-hover:animate-pulse text-yellow-600" />
                    <span className="relative z-10 font-semibold text-yellow-700">
                      💡 Hint
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
                aria-label="🔊 Play pronunciation - Hear how to say this word!"
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

            {/* Hint Display */}
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
                  aria-label="Word hint"
                  aria-live="polite"
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Lightbulb
                      className="w-4 h-4 text-yellow-600"
                      aria-hidden="true"
                    />
                    <h2 className="text-sm font-semibold text-yellow-800">
                      💡 Hint:
                    </h2>
                  </div>
                  <p className="text-yellow-700 text-sm" id="hint-text">
                    "{currentWord.definition}"
                  </p>
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
                  aria-label="Word answer revealed"
                  aria-live="polite"
                >
                  {/* Word Name */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-center bg-gradient-to-br from-green-50 via-emerald-50/30 to-blue-50 p-4 md:p-6 rounded-2xl border border-green-200/60 shadow-lg backdrop-blur-sm ring-1 ring-green-100/50 relative overflow-hidden"
                  >
                    {/* Success celebration background */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0.8 }}
                      animate={{ scale: 3, opacity: 0 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="absolute inset-0 bg-gradient-to-r from-green-200/30 to-emerald-200/30 rounded-2xl"
                    />

                    <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-3 relative z-10">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          delay: 0.3,
                          duration: 0.5,
                          type: "spring",
                        }}
                        className="text-2xl md:text-3xl"
                        aria-hidden="true"
                      >
                        {currentWord.emoji}
                      </motion.div>

                      <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="text-base md:text-lg lg:text-xl font-bold text-gray-800 tracking-wide"
                        id="word-answer"
                      >
                        {currentWord.word.toUpperCase()}
                      </motion.h2>

                      <motion.div
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          delay: 0.5,
                          duration: 0.5,
                          type: "spring",
                        }}
                        className="text-2xl md:text-3xl"
                        aria-hidden="true"
                      >
                        {currentWord.emoji}
                      </motion.div>
                    </div>

                    {/* Pronunciation */}
                    {currentWord.pronunciation && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <span className="text-lg text-gray-600 font-mono">
                          /{currentWord.pronunciation}/
                        </span>
                      </motion.div>
                    )}

                    {/* Floating success elements */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: [0, 1, 0],
                        y: [20, -10, -30],
                        x: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: "easeInOut",
                      }}
                      className="absolute top-2 right-4 text-yellow-400 text-sm"
                    >
                      ⭐
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: [0, 1, 0],
                        y: [20, -15, -35],
                        x: [0, -15, 10, 0],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatDelay: 4,
                        delay: 1,
                        ease: "easeInOut",
                      }}
                      className="absolute top-4 left-4 text-green-400 text-xs"
                    >
                      ✨
                    </motion.div>
                  </motion.div>

                  {/* Definition and Example - Hidden to show word name only */}
                  <div className="hidden bg-gray-50 p-6 rounded-2xl">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        📖 Definition:
                      </h3>
                      <p className="text-xl text-gray-800 leading-relaxed">
                        {currentWord.definition}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        💬 Example:
                      </h3>
                      <p className="text-lg text-gray-700 italic leading-relaxed">
                        "{currentWord.example}"
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons - Always visible */}
            {!isAnswered && (
              <div
                className="space-y-3 sm:space-y-4 px-2 sm:px-0"
                role="group"
                aria-label="Word learning choices"
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

                {/* Particle Effects Overlay */}
                <AnimatePresence>
                  {particles.map((particle) => (
                    <motion.div
                      key={particle.id}
                      initial={{
                        scale: 0,
                        x: particle.x - window.innerWidth / 2,
                        y: particle.y - window.innerHeight / 2,
                        opacity: 1,
                      }}
                      animate={{
                        scale: [0, 1, 0.8, 0],
                        x:
                          particle.x -
                          window.innerWidth / 2 +
                          (Math.random() - 0.5) * 200,
                        y:
                          particle.y -
                          window.innerHeight / 2 -
                          Math.random() * 150 -
                          50,
                        opacity: [1, 1, 0.7, 0],
                        rotate: Math.random() * 360,
                      }}
                      transition={{
                        duration: 1,
                        ease: "easeOut",
                        times: [0, 0.2, 0.8, 1],
                      }}
                      className="fixed pointer-events-none z-50"
                      style={{
                        left: "50%",
                        top: "50%",
                      }}
                    >
                      <div
                        className={`text-2xl ${
                          particle.type === "success"
                            ? "filter drop-shadow-lg"
                            : "filter drop-shadow-md"
                        }`}
                      >
                        {particle.type === "success" ? "⭐" : "💪"}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Skip button (smaller, less prominent) - HIDDEN */}
                <div className="hidden text-center mt-1 mb-0">
                  <Button
                    onClick={() => handleWordAction("skipped")}
                    variant="ghost"
                    size="sm"
                    disabled={isAnswered}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed py-1 px-3"
                  >
                    <SkipForward className="w-4 h-4 mr-1" />
                    🤔 Try another word
                  </Button>

                  {/* Keyboard shortcuts hint - Desktop only */}
                  <div className="hidden md:block mt-2 text-xs text-gray-400">
                    💡 Shortcuts:{" "}
                    <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                      1
                    </kbd>{" "}
                    or{" "}
                    <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                      F
                    </kbd>{" "}
                    for Forgot,
                    <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs ml-1">
                      2
                    </kbd>{" "}
                    or{" "}
                    <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                      R
                    </kbd>{" "}
                    for Remember,
                    <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs ml-1">
                      Space
                    </kbd>{" "}
                    for Audio
                  </div>
                </div>

                {/* Compact Session Progress */}
                <div className="mt-2 bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50 rounded-xl p-3 sm:p-4 border border-blue-200/60 shadow-md backdrop-blur-sm ring-1 ring-blue-100/30">
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
                    {/* Compact Stats */}
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
                  </div>

                  {/* Compact encouraging message */}
                  <div className="mt-1 text-center">
                    {sessionStats.wordsRemembered >= 15 ? (
                      <div className="text-green-600 font-medium text-xs">
                        🌟 You're a superstar!
                      </div>
                    ) : sessionStats.wordsRemembered >= 10 ? (
                      <div className="text-green-600 font-medium text-xs">
                        🎯 Awesome job!
                      </div>
                    ) : sessionStats.wordsCompleted >= 10 ? (
                      <div className="text-blue-600 font-medium text-xs">
                        🔥 Keep going!
                      </div>
                    ) : (
                      <div className="text-purple-600 font-medium text-xs">
                        🌟 Great start!
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
                    className="text-gray-600"
                  >
                    Loading next word...
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Action Buttons - Hidden per user request */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <Button
          onClick={onQuickQuiz}
          className="bg-educational-pink hover:bg-educational-pink/90 text-white py-4 rounded-2xl transition-all duration-300 transform hover:scale-105"
        >
          <Trophy className="w-5 h-5 mr-2" />
          <div>
            <div className="font-bold">Quick Quiz</div>
            <div className="text-sm opacity-90">5 questions</div>
          </div>
        </Button>

        <Button
          onClick={onPracticeForgotten}
          className="bg-educational-yellow hover:bg-educational-yellow/90 text-white py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 relative"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          <div>
            <div className="font-bold">Practice</div>
            <div className="text-sm opacity-90">
              {forgottenWordsCount > 0
                ? `${forgottenWordsCount} words to review`
                : "Review words"}
            </div>
          </div>
          {forgottenWordsCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full border-2 border-white min-w-[24px] h-6 flex items-center justify-center animate-pulse">
              {forgottenWordsCount}
            </Badge>
          )}
        </Button>
      </div> */}

      {/* Live Stats Footer - Hidden */}
      {/* <div className="flex justify-center gap-6 text-center max-w-3xl mx-auto bg-white/50 backdrop-blur-sm p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-500" />
          <div>
            <div className="font-bold text-lg">{dailyGoal.streak}</div>
            <div className="text-sm text-gray-600">day streak</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-purple-500" />
          <div>
            <div className="font-bold text-lg">Level {currentLevel}</div>
            <div className="text-sm text-gray-600">{totalPoints} points</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" />
          <div>
            <div className="font-bold text-lg">
              {dailyGoal.completed}/{dailyGoal.target}
            </div>
            <div className="text-sm text-gray-600">daily goal</div>
          </div>
        </div>
      </div> */}

      {/* Enhanced Achievement Popup for Journey Achievements */}
      {journeyAchievements.length > 0 && (
        <EnhancedAchievementPopup
          achievements={journeyAchievements}
          onClose={() => setJourneyAchievements([])}
          onAchievementClaim={(achievement) => {
            console.log(
              "Journey achievement claimed in dashboard:",
              achievement,
            );
            // Could add additional reward logic here
          }}
          autoCloseDelay={2000} // Auto-close after 2 seconds for mobile optimization
        />
      )}
    </div>
  );
}
