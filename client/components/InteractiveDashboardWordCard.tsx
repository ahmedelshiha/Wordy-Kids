import React, { useState, useEffect, startTransition } from "react";
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
// EnhancedAchievementPopup removed - now using LightweightAchievementProvider
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
        if (!showHint && !showWordDetails) {
          setShowHint(true);
        }
        break;
      case "s":
      case "S":
        event.preventDefault();
        if (!showWordDetails) {
          setShowWordDetails(true);
        }
        break;
      case " ":
        event.preventDefault();
        playPronunciationDebounced(true);
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
  const [sessionWords, setSessionWords] = useState<Word[]>([]);
  const [showSessionComplete, setShowSessionComplete] = useState(false);
  const [sessionAchievements, setSessionAchievements] = useState<Achievement[]>(
    [],
  );
  // journeyAchievements state removed - now using event-based system

  // UI States
  const [showWordDetails, setShowWordDetails] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [celebrationEffect, setCelebrationEffect] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedbackType, setFeedbackType] = useState<
    "remembered" | "needs_practice" | null
  >(null);
  const [guess, setGuess] = useState("");

  // Enhanced visual feedback states
  const [particles, setParticles] = useState<
    Array<{ id: number; type: "success" | "practice"; x: number; y: number }>
  >([]);
  const [buttonClickedId, setButtonClickedId] = useState<string | null>(null);
  const [showSuccessRipple, setShowSuccessRipple] = useState(false);
  const [showPracticeRipple, setShowPracticeRipple] = useState(false);
  const [audioPlayedForHint, setAudioPlayedForHint] = useState(false);
  const [audioDebounce, setAudioDebounce] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Voice settings integration
  const voiceSettings = useVoiceSettings();

  // Progressive enhancement states
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Dynamic jungle adventure messages
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [messageVisible, setMessageVisible] = useState(true);

  const jungleAdventureMessages = [
    "🌿 Let's explore the jungle!",
    "🦜 Find the secret word!",
    "🐒 Swing into action!",
    "🐘 Stomp forward to learn!",
    "🦁 Roar into reading!",
    "🐯 Pounce on new words!",
    "🌳 Climb the learning tree!",
    "🦋 Flutter through phonics!",
  ];

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

  // Rotating jungle adventure messages effect
  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setMessageVisible(false);

      setTimeout(() => {
        setCurrentMessageIndex(
          (prev) => (prev + 1) % jungleAdventureMessages.length,
        );
        setMessageVisible(true);
      }, 300); // Quick fade transition
    }, 6000); // Rotate every 6 seconds

    return () => clearInterval(interval);
  }, [prefersReducedMotion, jungleAdventureMessages.length]);

  // Cleanup audio debounce on unmount
  useEffect(() => {
    return () => {
      if (audioDebounce) {
        clearTimeout(audioDebounce);
      }
    };
  }, [audioDebounce]);

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

  // Optimized: Preload next word's audio for faster loading
  useEffect(() => {
    // Guard against uninitialized state
    if (sessionWords.length === 0 || currentWordIndex < 0) return;

    const nextIndex = currentWordIndex + 1;
    if (nextIndex < sessionWords.length && nextIndex < SESSION_SIZE) {
      const nextWord = sessionWords[nextIndex];
      if (nextWord?.word) {
        // Preload audio for next word in background
        setTimeout(() => {
          try {
            enhancedAudioService.preloadWordAudio(nextWord.word);
          } catch (error) {
            // Silent fail - preloading is optional
          }
        }, 100);
      }
    }
  }, [currentWordIndex, sessionWords]);

  // Reset card state when starting new session
  useEffect(() => {
    if (sessionWords.length > 0 && currentWordIndex >= sessionWords.length) {
      setCurrentWordIndex(0);
    }
  }, [sessionWords, currentWordIndex]);

  // Reset card state when word changes
  useEffect(() => {
    setShowWordDetails(false);
    setShowHint(false);
    setIsAnswered(false);
    setGuess("");
    setImageLoaded(false);
    setImageError(false);
    setIsTransitioning(true);
    setAudioPlayedForHint(false);

    // Clear any pending audio debounce
    if (audioDebounce) {
      clearTimeout(audioDebounce);
      setAudioDebounce(null);
    }

    // Reset transition state after brief delay
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [currentWordIndex]);

  // Debounced pronunciation function to prevent double-play
  const playPronunciationDebounced = (isManual = false) => {
    console.log(
      `🔊 Audio call: ${isManual ? "Manual" : "Auto"}, audioPlayedForHint: ${audioPlayedForHint}, isPlaying: ${isPlaying}`,
    );

    // Clear any existing audio timeout
    if (audioDebounce) {
      clearTimeout(audioDebounce);
    }

    // For manual clicks, allow immediate play if not already playing
    if (isManual) {
      if (!isPlaying) {
        console.log("🔊 Playing audio manually");
        playPronunciation();
      } else {
        console.log("🔊 Audio already playing, skipping manual request");
      }
      return;
    }

    // For auto-play (hint), add debounce and check if already played
    if (audioPlayedForHint || isPlaying) {
      console.log("🔊 Audio blocked: already played or currently playing");
      return;
    }

    console.log("🔊 Setting up auto-play with 150ms debounce");
    const timer = setTimeout(() => {
      if (!audioPlayedForHint && !isPlaying && currentWord) {
        console.log("🔊 Auto-playing audio after debounce");
        playPronunciation();
        setAudioPlayedForHint(true);
      } else {
        console.log("🔊 Auto-play cancelled: conditions changed");
      }
    }, 150); // 150ms debounce as requested

    setAudioDebounce(timer);
  };

  // Automatically pronounce word when hint is shown (only once per word)
  useEffect(() => {
    if (showHint && currentWord && !audioPlayedForHint) {
      // Delay to allow hint card animation to start
      const timer = setTimeout(() => {
        playPronunciationDebounced(false);
        setAudioPlayedForHint(true); // Mark as played to prevent duplicate
      }, 250); // Slightly reduced delay

      return () => clearTimeout(timer);
    }
  }, [showHint, currentWord, audioPlayedForHint]);

  const playPronunciation = () => {
    if (currentWord && !isPlaying) {
      triggerHapticFeedback("light"); // Light feedback for audio action
      setIsPlaying(true);

      // Play available jungle adventure sound effects
      try {
        const difficulty = currentWord.difficulty || "medium";

        // Use available sound methods from audioService
        switch (difficulty) {
          case "easy":
            // Gentle click sound for easy words
            audioService.playClickSound();
            break;
          case "medium":
            // Whoosh sound for medium words
            audioService.playWhooshSound();
            break;
          case "hard":
            // Cheer sound for hard words
            audioService.playCheerSound();
            break;
        }
      } catch (error) {
        console.log(
          "Jungle sound effect not available, proceeding with pronunciation",
        );
      }

      // Pronounce word with enhanced error handling
      try {
        if (
          !enhancedAudioService ||
          typeof enhancedAudioService.pronounceWord !== "function"
        ) {
          throw new Error("Enhanced audio service not available");
        }

        // Validate word before speech synthesis
        const wordToSpeak = currentWord?.word;
        if (
          !wordToSpeak ||
          typeof wordToSpeak !== "string" ||
          wordToSpeak.trim().length === 0
        ) {
          console.error("Invalid word for speech synthesis:", {
            currentWord,
            wordToSpeak,
            type: typeof wordToSpeak,
          });
          setIsPlaying(false);
          return;
        }

        enhancedAudioService.pronounceWord(wordToSpeak, {
          onStart: () => {
            console.log("Speech started successfully");
            setIsPlaying(true);
          },
          onEnd: () => {
            console.log("Speech completed successfully");
            setIsPlaying(false);
          },
          onError: (errorDetails) => {
            // Proper error handling and logging
            const errorInfo = {
              word: currentWord.word,
              service: "enhancedAudioService",
              timestamp: new Date().toISOString(),
              errorDetails:
                errorDetails instanceof Error
                  ? {
                      name: errorDetails.name,
                      message: errorDetails.message,
                      stack: errorDetails.stack,
                    }
                  : typeof errorDetails === "object" && errorDetails !== null
                    ? JSON.stringify(errorDetails)
                    : String(errorDetails || "No error details provided"),
            };

            console.error("Speech synthesis failed for word:", errorInfo);
            setIsPlaying(false);

            // Fallback: try with basic audioService
            try {
              if (
                !audioService ||
                typeof audioService.pronounceWord !== "function"
              ) {
                throw new Error("Basic audio service not available");
              }

              console.log(
                "Attempting fallback to basic audioService for word:",
                currentWord.word,
              );
              audioService.pronounceWord(currentWord.word, {
                onStart: () => {
                  console.log(
                    "Fallback audioService started successfully for:",
                    currentWord.word,
                  );
                  setIsPlaying(true);
                },
                onEnd: () => {
                  console.log(
                    "Fallback audioService completed successfully for:",
                    currentWord.word,
                  );
                  setIsPlaying(false);
                },
                onError: (fallbackErrorDetails) => {
                  const fallbackErrorInfo = {
                    word: currentWord.word,
                    service: "basicAudioService",
                    timestamp: new Date().toISOString(),
                    errorDetails:
                      fallbackErrorDetails instanceof Error
                        ? {
                            name: fallbackErrorDetails.name,
                            message: fallbackErrorDetails.message,
                            stack: fallbackErrorDetails.stack,
                          }
                        : typeof fallbackErrorDetails === "object" &&
                            fallbackErrorDetails !== null
                          ? JSON.stringify(fallbackErrorDetails)
                          : String(
                              fallbackErrorDetails ||
                                "No error details provided",
                            ),
                  };

                  console.error(
                    "Fallback audioService also failed for word:",
                    fallbackErrorInfo,
                  );
                  setIsPlaying(false);
                },
              });
            } catch (fallbackError) {
              const catchErrorInfo = {
                word: currentWord.word,
                service: "fallbackCatch",
                timestamp: new Date().toISOString(),
                error:
                  fallbackError instanceof Error
                    ? {
                        name: fallbackError.name,
                        message: fallbackError.message,
                        stack: fallbackError.stack,
                      }
                    : typeof fallbackError === "object" &&
                        fallbackError !== null
                      ? JSON.stringify(fallbackError)
                      : String(fallbackError),
              };

              console.error(
                "Fallback speech synthesis also failed:",
                catchErrorInfo,
              );
              setIsPlaying(false);
            }
          },
        });
      } catch (mainError) {
        const mainErrorInfo = {
          word: currentWord.word,
          service: "mainCatch",
          timestamp: new Date().toISOString(),
          error:
            mainError instanceof Error
              ? {
                  name: mainError.name,
                  message: mainError.message,
                  stack: mainError.stack,
                }
              : typeof mainError === "object" && mainError !== null
                ? JSON.stringify(mainError)
                : String(mainError),
        };

        console.error("Main speech synthesis failed:", mainErrorInfo);
        setIsPlaying(false);
      }
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

    // Optimized: Reduce console logging in production
    if (process.env.NODE_ENV === "development") {
      console.log(`Word Action: ${currentWord.word} - ${status}`, {
        wordId: currentWord.id,
        sessionProgress: `${currentWordIndex + 1}/${SESSION_SIZE}`,
        sessionStats,
      });
    }

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

    // Show celebration effect for successful interactions with jungle adventure audio
    if (status === "remembered") {
      setCelebrationEffect(true);

      // Optimized: Play jungle celebration sound with faster execution
      try {
        const difficulty = currentWord.difficulty || "medium";
        // Play primary sound immediately
        enhancedAudioService.playSuccessSound();

        // Queue secondary sound without blocking (optimized timing)
        setTimeout(() => {
          try {
            switch (difficulty) {
              case "easy":
                audioService.playClickSound();
                break;
              case "medium":
                audioService.playWhooshSound();
                break;
              case "hard":
                audioService.playCheerSound();
                break;
            }
          } catch (e) {
            // Silent fail for better performance
          }
        }, 100); // Reduced from 200ms to 100ms
      } catch (error) {
        // Fallback to basic audioService
        try {
          audioService.playSuccessSound();
        } catch (fallbackError) {
          // Silent fail for better performance
        }
      }

      setTimeout(() => setCelebrationEffect(false), 1000);
    } else if (status === "needs_practice") {
      // Play encouraging jungle sound with error handling
      try {
        enhancedAudioService.playEncouragementSound();
      } catch (error) {
        console.log(
          "Enhanced encouragement sound failed, using basic fallback",
        );
        try {
          audioService.playEncouragementSound();
        } catch (fallbackError) {
          console.log("All encouragement sounds failed:", fallbackError);
        }
      }
    }

    try {
      // Call the progress callback for overall tracking
      await onWordProgress(currentWord, status);
      console.log(`Word progress callback completed for: ${currentWord.word}`);
      console.log(
        `Session progress: ${newStats.wordsCompleted}/${SESSION_SIZE}, Accuracy: ${newStats.accuracy}%`,
      );

      // Optimized: Defer achievement tracking to avoid blocking next word loading
      setTimeout(() => {
        try {
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
          const enhancedAchievements = EnhancedAchievementTracker.trackActivity(
            {
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
            },
          );

          // Combine achievements from both systems
          const allNewAchievements = [
            ...newJourneyAchievements,
            ...enhancedAchievements,
          ];

          // Show enhanced achievements if any were unlocked
          if (allNewAchievements.length > 0) {
            // Trigger achievements through new lightweight popup system immediately
            allNewAchievements.forEach((achievement) => {
              const event = new CustomEvent("milestoneUnlocked", {
                detail: { achievement },
              });
              window.dispatchEvent(event);
            });
          }
        } catch (error) {
          console.error("Error in deferred achievement tracking:", error);
        }
      }, 50); // Process achievements asynchronously after 50ms
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

      // Trigger session achievements through new lightweight popup system
      if (allSessionAchievements.length > 0) {
        setTimeout(() => {
          allSessionAchievements.forEach((achievement) => {
            const event = new CustomEvent("milestoneUnlocked", {
              detail: { achievement },
            });
            window.dispatchEvent(event);
          });
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
        sessionAchievements: allSessionAchievements.length,
        totalWordsCompleted,
      });
      return;
    }

    // Auto-advance to next word after progress is recorded (optimized timing)
    setTimeout(
      () => {
        advanceToNextWord();
      },
      status === "remembered" ? 800 : 400,
    );
  };

  const advanceToNextWord = () => {
    // Optimized: Reduce console logging in production
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Advancing from word ${currentWordIndex + 1}/${SESSION_SIZE}`,
      );
    }

    // Start transition effect
    setIsTransitioning(true);

    // Optimized: Batch all state resets and reduce delay
    setTimeout(() => {
      // Optimized: Use startTransition for non-urgent state updates
      const nextIndex = currentWordIndex + 1;

      // Critical update: Move to next word immediately
      if (nextIndex < SESSION_SIZE && nextIndex < sessionWords.length) {
        setCurrentWordIndex(nextIndex);
        if (process.env.NODE_ENV === "development") {
          console.log(
            `Advanced to word ${nextIndex + 1}/${SESSION_SIZE}: ${sessionWords[nextIndex]?.word}`,
          );
        }
      } else if (process.env.NODE_ENV === "development") {
        console.log("Reached end of session words");
      }

      // Non-critical updates: Batch in startTransition for better performance
      startTransition(() => {
        setIsAnswered(false);
        setFeedbackType(null);
        setCelebrationEffect(false);
        setShowWordDetails(false);
        setShowHint(false);
        setParticles([]);
        setButtonClickedId(null);
        setShowSuccessRipple(false);
        setShowPracticeRipple(false);
        setIsTransitioning(false);
      });
    }, 150); // Reduced from 300ms to 150ms
  };

  const startNewSession = () => {
    console.log("Starting new session...");

    // Reset all session state
    setShowSessionComplete(false);
    setSessionAchievements([]);
    // journeyAchievements state removed - now using event-based system
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
        const feedbackEmoji = feedbackType === "remembered" ? "😊" : "💪";
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
            className={`w-48 h-36 ml-2 mt-4 flex flex-col items-center justify-center relative`}
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
              animate={
                !prefersReducedMotion
                  ? {
                      y: [0, -5, 0],
                      scale: [1, 1.1, 1],
                    }
                  : {}
              }
              transition={
                !prefersReducedMotion
                  ? {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
                  : { duration: 0 }
              }
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

            {/* Single sparkle for success - Only if motion allowed */}
            {feedbackType === "remembered" && !prefersReducedMotion && (
              <motion.div
                key={`feedback-sparkle-${currentWordIndex}`}
                initial={{ opacity: 0, scale: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  y: -25,
                }}
                transition={{
                  duration: 1.2,
                  ease: "easeOut",
                }}
                className="absolute text-yellow-300 text-sm top-0 left-1/2 transform -translate-x-1/2"
              >
                ✨
              </motion.div>
            )}
          </motion.div>
        );
      }

      return (
        <motion.div
          key={`emoji-normal-${currentWordIndex}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.3 },
          }}
          whileTap={{ scale: 0.95 }}
          className="w-48 h-36 ml-2 mt-4 flex items-center justify-center cursor-pointer group relative"
          onClick={() => playPronunciationDebounced(true)}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-2 right-2 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            🔊
          </div>

          {/* Main emoji with enhanced visibility and gentle animation */}
          <motion.div
            key={`emoji-inner-${currentWordIndex}`}
            animate={
              !prefersReducedMotion
                ? {
                    y: [0, -6, 0],
                    rotate: [-2, 2, -2],
                  }
                : {}
            }
            transition={
              !prefersReducedMotion
                ? {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
                : { duration: 0 }
            }
            whileHover={
              !prefersReducedMotion
                ? {
                    y: -3,
                    scale: 1.05,
                    transition: { duration: 0.2 },
                  }
                : {}
            }
            className="relative z-10 -translate-x-12"
          >
            {/* White glow background for visibility */}
            <span className="absolute inset-0 blur-md bg-white/60 rounded-full scale-110 -z-10"></span>

            {/* Main emoji with adjusted size */}
            <span
              className="text-8xl relative inline-block drop-shadow-lg"
              style={{
                filter: "drop-shadow(0 0 12px rgba(255, 255, 255, 0.8))",
                textShadow: "0 0 15px rgba(255, 255, 255, 0.9)",
              }}
            >
              {currentWord.emoji}
            </span>
          </motion.div>

          {/* Jungle Adventure Background Pattern */}
          <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <div
              className="w-full h-full rounded-2xl"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 25% 25%, rgba(76, 175, 80, 0.2) 0%, transparent 40%),
                  radial-gradient(circle at 75% 75%, rgba(255, 193, 7, 0.15) 0%, transparent 40%),
                  linear-gradient(45deg, transparent 30%, rgba(76, 175, 80, 0.05) 50%, transparent 70%)
                `,
              }}
            />
          </div>
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
            "w-[350px] h-[500px] sm:w-[440px] sm:h-[520px] md:w-[480px] md:h-[520px] lg:w-[520px] lg:h-[540px] xl:w-[540px] xl:h-[560px] mx-auto relative overflow-hidden",
            "jungle-adventure-card-container",
            "ai-card-background",
            "bg-transparent", // Override default Card white background
            "shadow-lg hover:shadow-xl border-0 rounded-3xl sm:rounded-[2rem]",
            "", // Removed backdrop-blur and ring for non-glossy appearance
            celebrationEffect &&
              "jungle-celebration-glow animate-pulse shadow-2xl",
          )}
          style={{
            boxShadow: `
              0 25px 50px rgba(0, 0, 0, 0.3),
              0 0 30px rgba(255, 215, 0, 0.2),
              0 0 60px rgba(34, 197, 94, 0.1)
            `,
          }}
        >
          {/* Simplified Jungle Background Elements - Only if animation enabled */}
          {!prefersReducedMotion && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              {/* Single subtle vine animation */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-10 -left-5 text-3xl opacity-15 text-jungle-light"
              >
                🌿
              </motion.div>
            </div>
          )}

          {/* Simplified Celebration Effects - Only 2 elements */}
          {celebrationEffect && !prefersReducedMotion && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.2, 0],
                  opacity: [0, 1, 0],
                  y: [0, -30],
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute top-4 left-4 text-2xl text-sunshine"
              >
                ✨
              </motion.div>

              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.3, 0],
                  opacity: [0, 1, 0],
                  y: [0, -35],
                }}
                transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
                className="absolute top-6 right-6 text-3xl text-jungle-light"
              >
                🌟
              </motion.div>
            </div>
          )}

          <CardContent className="p-3 sm:p-4 md:p-4 lg:p-5 xl:p-6 relative z-10">
            {/* Jungle Adventure Surface Glow - Removed for non-glossy appearance */}
            {/* Jungle Photo Texture Overlay - Removed for non-glossy appearance */}
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
                      if (wordsLearned >= goal * 2) return "🏆";
                      if (wordsLearned >= goal * 1.5) return "🚀";
                      return "🌟";
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
                        return "🌟 Goal achieved! You're incredible!";
                      }
                      if (percentage >= 90)
                        return "🌟 Almost there, superstar!";
                      if (percentage >= 75) return "⭐ You're doing great!";
                      if (percentage >= 50) return "💪 Keep going, champion!";
                      if (percentage >= 25) return "🌱 Nice start!";
                      return "🌟 Ready for an adventure?";
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Achievement Teaser - DISABLED
            <div aria-live="polite" aria-label="Motivational messages">
              <AchievementTeaser className="mb-3" />
            </div>
            */}

            {/* Jungle Adventure Game Instructions */}
            <header className="text-center mb-3 sm:mb-4 md:mb-5" role="banner">
              <motion.div
                key={`jungle-prompt-${currentWordIndex}`}
                initial={{ opacity: 0, y: -20, scale: 0.9, rotateY: -15 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
                transition={{
                  duration: 0.8,
                  type: "spring",
                  stiffness: 150,
                  damping: 20,
                  delay: 0.2,
                }}
                className="relative"
              >
                {/* Simplified Background Glow - Only if motion allowed */}
                {!prefersReducedMotion && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{ scale: 1.2, opacity: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute inset-0 bg-gradient-to-r from-jungle/15 via-sunshine/20 to-jungle/15 rounded-3xl blur-lg"
                  />
                )}

                {/* Dynamic Jungle Explorer Prompt */}
                <motion.h1
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={
                    !prefersReducedMotion
                      ? {
                          scale: [1, 1.02, 1],
                          opacity: messageVisible ? 1 : 0,
                        }
                      : { scale: 1, opacity: messageVisible ? 1 : 0 }
                  }
                  transition={
                    !prefersReducedMotion
                      ? {
                          scale: {
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                          opacity: {
                            duration: 0.3,
                            ease: "easeInOut",
                          },
                        }
                      : { duration: 0.3, ease: "easeInOut" }
                  }
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-1 sm:mb-2 relative z-10"
                  aria-live="polite"
                  aria-label="Adventure message"
                  style={{
                    textShadow:
                      "0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(76, 175, 80, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)",
                    fontFamily: "'Baloo 2', cursive",
                  }}
                >
                  {(() => {
                    // Dynamic jungle adventure prompts based on word difficulty and category
                    const difficulty = currentWord?.difficulty || "medium";
                    const category = currentWord?.category || "general";
                    const sessionProgress = Math.round(
                      (sessionStats.wordsCompleted / SESSION_SIZE) * 100,
                    );

                    // Jungle Explorer Characters
                    const jungleExplorers = {
                      easy: ["🐵", "🦜", "🐨", "🦋", "🐝"],
                      medium: ["🦁", "🐯", "🐘", "🦓", "🦏"],
                      hard: ["🐲", "🦅", "🐺", "🐆", "🦁"],
                    };

                    // Category-specific prompts
                    const categoryPrompts = {
                      Animals: {
                        easy: [
                          "🐵 What jungle friend is this?",
                          "🦜 Which animal companion do you see?",
                          "🐨 Can you name this jungle buddy?",
                          "🐸 What creature lives in our jungle?",
                        ],
                        medium: [
                          "🦁 What majestic jungle animal is this?",
                          "🐯 Which powerful jungle hunter do you see?",
                          "🐘 Can you identify this jungle giant?",
                          "🦓 What striped jungle dweller is this?",
                        ],
                        hard: [
                          "🐲 What legendary jungle creature awaits?",
                          "🦅 Which apex jungle predator soars here?",
                          "🐺 Can you name this elusive jungle hunter?",
                          "🐆 What spotted jungle master is this?",
                        ],
                      },
                      Nature: {
                        easy: [
                          "🌸 What jungle treasure is this?",
                          "🌺 Which jungle bloom do you see?",
                          "🍃 Can you name this jungle wonder?",
                          "🌳 What grows in our jungle home?",
                        ],
                        medium: [
                          "🌲 What ancient jungle guardian is this?",
                          "🎋 Which jungle element do you recognize?",
                          "🌾 Can you identify this jungle gift?",
                          "🌴 What tropical jungle beauty is this?",
                        ],
                        hard: [
                          "⚡ What powerful jungle force awaits?",
                          "🌟 Which jungle phenomenon do you see?",
                          "🌊 Can you name this jungle mystery?",
                          "🔥 What fierce jungle element is this?",
                        ],
                      },
                      Food: {
                        easy: [
                          "🍌 What jungle snack is this?",
                          "🥥 Which jungle treat do you see?",
                          "🍯 Can you name this jungle delight?",
                          "🫐 What jungle berry is this?",
                        ],
                        medium: [
                          "🥭 What exotic jungle fruit is this?",
                          "🍍 Which tropical jungle treasure awaits?",
                          "🥑 Can you identify this jungle nutrition?",
                          "🌽 What jungle harvest is this?",
                        ],
                        hard: [
                          "🍄 What rare jungle delicacy is this?",
                          "🌶️ Which ancient jungle spice awaits?",
                          "🌶️ Can you name this fiery jungle flavor?",
                          "🌿 What powerful jungle ingredient is this?",
                        ],
                      },
                      Objects: {
                        easy: [
                          "🔧 What jungle tool is this?",
                          "🎒 Which jungle gear do you see?",
                          "🧭 Can you name this jungle helper?",
                          "⛺ What jungle shelter is this?",
                        ],
                        medium: [
                          "🏹 What jungle equipment awaits?",
                          "🛶 Which jungle vessel do you recognize?",
                          "🔥 Can you identify this jungle necessity?",
                          "🗡️ What jungle instrument is this?",
                        ],
                        hard: [
                          "⚔️ What legendary jungle artifact is this?",
                          "🏺 Which ancient jungle relic awaits?",
                          "🔮 Can you name this mystical jungle object?",
                          "👑 What sacred jungle treasure is this?",
                        ],
                      },
                    };

                    // Default prompts for unknown categories
                    const defaultPrompts = {
                      easy: [
                        "🌟 What jungle discovery is this?",
                        "🦋 Which jungle wonder do you see?",
                        "🌈 Can you name this jungle magic?",
                        "✨ What sparkles in our jungle?",
                      ],
                      medium: [
                        "🔍 What jungle mystery awaits you?",
                        "🎯 Which jungle challenge do you see?",
                        "💎 Can you solve this jungle puzzle?",
                        "🗝️ What jungle secret is this?",
                      ],
                      hard: [
                        "⚡ What legendary jungle power is this?",
                        "🌋 Which epic jungle force awaits?",
                        "🏆 Can you conquer this jungle trial?",
                        "👑 What ultimate jungle quest is this?",
                      ],
                    };

                    // Progress-based encouragement
                    const progressPrompts = {
                      0: jungleAdventureMessages[currentMessageIndex],
                      25: "🌟 You're exploring well, jungle explorer!",
                      50: "🏆 Halfway through the jungle quest!",
                      75: "⚡ Almost at the jungle summit!",
                      90: "�� Final jungle challenges await!",
                    };

                    // Get category-specific prompts or use defaults
                    const categoryKey =
                      Object.keys(categoryPrompts).find((key) =>
                        category.toLowerCase().includes(key.toLowerCase()),
                      ) || "default";

                    const prompts =
                      categoryKey === "default"
                        ? defaultPrompts[difficulty]
                        : categoryPrompts[categoryKey][difficulty];

                    // Progress milestone check
                    const progressMilestone = Object.keys(progressPrompts)
                      .reverse()
                      .find(
                        (milestone) => sessionProgress >= parseInt(milestone),
                      );

                    if (
                      progressMilestone &&
                      sessionProgress >= parseInt(progressMilestone)
                    ) {
                      return progressPrompts[progressMilestone];
                    }

                    // Select prompt based on word index for variety
                    const promptIndex = currentWordIndex % prompts.length;
                    return prompts[promptIndex];
                  })()}
                </motion.h1>

                {/* Single Floating Element - Only if motion allowed */}
                {!prefersReducedMotion && (
                  <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                      animate={{
                        y: [0, -8, 0],
                        opacity: [0.4, 0.7, 0.4],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute top-0 right-2 text-xs"
                    >
                      ✨
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </header>

            {/* Category and Progress Header */}
            <div className="text-center mb-4 sm:mb-6 md:mb-8">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                {/* Jungle Adventure Difficulty Badge */}
                <Badge
                  className={cn(
                    "text-xs sm:text-sm px-2 sm:px-3 py-1 font-bold jungle-adventure-badge relative overflow-hidden",
                    currentWord.difficulty === "easy"
                      ? "bg-gradient-to-r from-jungle-light to-jungle text-white border-jungle shadow-lg"
                      : currentWord.difficulty === "medium"
                        ? "bg-gradient-to-r from-sunshine to-sunshine-dark text-white border-sunshine-dark shadow-lg"
                        : currentWord.difficulty === "hard"
                          ? "bg-gradient-to-r from-red-500 to-red-700 text-white border-red-600 shadow-lg"
                          : "bg-gradient-to-r from-gray-400 to-gray-600 text-white border-gray-500 shadow-lg",
                  )}
                  style={{
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
                    boxShadow:
                      currentWord.difficulty === "easy"
                        ? "0 0 15px rgba(76, 175, 80, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                        : currentWord.difficulty === "medium"
                          ? "0 0 15px rgba(255, 193, 7, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                          : currentWord.difficulty === "hard"
                            ? "0 0 15px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                            : "0 0 10px rgba(107, 114, 128, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                  }}
                >
                  {(() => {
                    const difficulty = currentWord.difficulty || "medium";
                    const difficultyEmojis = {
                      easy: "🌱",
                      medium: "⭐",
                      hard: "🔥",
                    };
                    const difficultyNames = {
                      easy: "Explorer",
                      medium: "Adventurer",
                      hard: "Legend",
                    };

                    return `${difficultyEmojis[difficulty]} ${difficultyNames[difficulty]}`;
                  })()}
                </Badge>
                {/* Jungle Adventure Category Badge */}
                <Badge
                  className={cn(
                    "text-xs sm:text-sm px-2 sm:px-3 py-1 font-semibold relative overflow-hidden",
                    "bg-gradient-to-r from-jungle/80 to-jungle-dark/90 text-white border-jungle-light shadow-md",
                  )}
                  style={{
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.4)",
                    boxShadow:
                      "0 0 10px rgba(76, 175, 80, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                  }}
                >
                  {(() => {
                    const category = currentWord.category;
                    const categoryEmojis = {
                      Animals: "🐵",
                      Nature: "🌿",
                      Food: "🍎",
                      Objects: "🎯",
                      Colors: "🌈",
                      Body: "👤",
                      Family: "👨‍👩‍👧‍👦",
                      Home: "🏠",
                      Transportation: "🚗",
                      Clothes: "👕",
                    };

                    const emoji = categoryEmojis[category] || "🌟";
                    return `${emoji} ${category}`;
                  })()}
                </Badge>
                {/* Jungle Adventure Progress Badge */}
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs sm:text-sm px-2 sm:px-3 py-1 font-bold relative overflow-hidden",
                    sessionStats.accuracy >= 90
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-500"
                      : sessionStats.accuracy >= 75
                        ? "bg-gradient-to-r from-jungle-light to-jungle text-white border-jungle"
                        : sessionStats.accuracy >= 50
                          ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white border-blue-500"
                          : "bg-gradient-to-r from-gray-400 to-gray-600 text-white border-gray-500",
                  )}
                  style={{
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.4)",
                    boxShadow:
                      sessionStats.accuracy >= 90
                        ? "0 0 12px rgba(255, 193, 7, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                        : sessionStats.accuracy >= 75
                          ? "0 0 12px rgba(76, 175, 80, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                          : "0 0 8px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                  }}
                >
                  {(() => {
                    const accuracy = sessionStats.accuracy;
                    let emoji, title;

                    if (accuracy >= 90) {
                      emoji = "👑";
                      title = "Jungle Master";
                    } else if (accuracy >= 75) {
                      emoji = "🏆";
                      title = "Jungle Hero";
                    } else if (accuracy >= 50) {
                      emoji = "��";
                      title = "Explorer";
                    } else {
                      emoji = "🌱";
                      title = "Rookie";
                    }

                    return `${emoji} ${accuracy}% ${title}`;
                  })()}
                </Badge>
              </div>
            </div>

            {/* Picture Display with State Transitions */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`word-${currentWordIndex}-${showWordDetails ? "revealed" : "hidden"}`}
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

            {/* Hint Display */}
            <AnimatePresence>
              {showHint && !showWordDetails && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{
                    duration: 0.4,
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                  className="mb-2 md:mb-3 -mt-2"
                  role="region"
                  aria-label="Word hint revealed"
                  aria-live="polite"
                >
                  {/* Achievement-Style Jungle Hint Card */}
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.8,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.8,
                      y: -20,
                    }}
                    transition={{
                      type: "spring",
                      duration: 0.4,
                      damping: 15,
                      stiffness: 300,
                    }}
                    className="mx-auto max-w-[280px] w-full relative overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, #2e7d32 0%, #4caf50 50%, #66bb6a 100%)",
                      border: "4px solid #ffd700",
                      borderRadius: "20px",
                      padding: "16px 20px",
                      textAlign: "center",
                      color: "white",
                      fontFamily:
                        '"Comic Sans MS", "Fredoka One", cursive, sans-serif',
                      boxShadow: `
                        0 10px 30px rgba(0, 0, 0, 0.3),
                        0 0 20px rgba(255, 215, 0, 0.4),
                        inset 0 2px 0 rgba(255, 255, 255, 0.2)
                      `,
                      transformOrigin: "center center",
                    }}
                  >
                    {/* Achievement-Style Jungle Vines Frame */}
                    <div
                      className="absolute inset-0 pointer-events-none overflow-hidden"
                      style={{ borderRadius: "20px" }}
                    >
                      {!prefersReducedMotion && (
                        <>
                          <motion.div
                            animate={{
                              rotate: [0, 2, 0, -1, 0],
                              y: [0, 1, 0],
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="absolute text-2xl z-1"
                            style={{
                              top: "-8px",
                              left: "-4px",
                              animationDelay: "0s",
                            }}
                          >
                            🌟
                          </motion.div>
                          <motion.div
                            animate={{
                              rotate: [0, -2, 0, 1, 0],
                              y: [0, -1, 0],
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 1,
                            }}
                            className="absolute text-2xl z-1"
                            style={{
                              top: "-8px",
                              right: "-4px",
                              animationDelay: "1s",
                            }}
                          >
                            🍃
                          </motion.div>
                          <motion.div
                            animate={{
                              rotate: [0, 1, 0, -2, 0],
                              y: [0, 1, 0],
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 2,
                            }}
                            className="absolute text-2xl z-1"
                            style={{
                              bottom: "-8px",
                              left: "-4px",
                              animationDelay: "2s",
                            }}
                          >
                            🌱
                          </motion.div>
                          <motion.div
                            animate={{
                              rotate: [0, -1, 0, 2, 0],
                              y: [0, -1, 0],
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 3,
                            }}
                            className="absolute text-2xl z-1"
                            style={{
                              bottom: "-8px",
                              right: "-4px",
                              animationDelay: "3s",
                            }}
                          >
                            🌿
                          </motion.div>
                        </>
                      )}
                      {/* Static vines for reduced motion */}
                      {prefersReducedMotion && (
                        <>
                          <div
                            className="absolute text-2xl z-1"
                            style={{ top: "-8px", left: "-4px" }}
                          >
                            🌿
                          </div>
                          <div
                            className="absolute text-2xl z-1"
                            style={{ top: "-8px", right: "-4px" }}
                          >
                            🍃
                          </div>
                          <div
                            className="absolute text-2xl z-1"
                            style={{ bottom: "-8px", left: "-4px" }}
                          >
                            🌱
                          </div>
                          <div
                            className="absolute text-2xl z-1"
                            style={{ bottom: "-8px", right: "-4px" }}
                          >
                            🌿
                          </div>
                        </>
                      )}
                    </div>

                    {/* Achievement-Style Fireflies */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {!prefersReducedMotion && (
                        <>
                          <motion.div
                            animate={{
                              x: [0, 10, -5, 8, 0],
                              y: [0, -8, 5, -3, 0],
                              opacity: [0.6, 1, 0.8, 1, 0.6],
                            }}
                            transition={{
                              duration: 6,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="absolute text-sm opacity-80"
                            style={{
                              top: "20%",
                              left: "10%",
                            }}
                          >
                            ✨
                          </motion.div>
                          <motion.div
                            animate={{
                              x: [0, -8, 6, -4, 0],
                              y: [0, 5, -8, 3, 0],
                              opacity: [0.8, 1, 0.6, 1, 0.8],
                            }}
                            transition={{
                              duration: 6,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 2,
                            }}
                            className="absolute text-sm opacity-80"
                            style={{
                              top: "60%",
                              right: "15%",
                            }}
                          >
                            ✨
                          </motion.div>
                          <motion.div
                            animate={{
                              x: [0, 6, -10, 4, 0],
                              y: [0, -5, 8, -6, 0],
                              opacity: [0.7, 1, 0.9, 1, 0.7],
                            }}
                            transition={{
                              duration: 6,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 4,
                            }}
                            className="absolute text-sm opacity-80"
                            style={{
                              bottom: "25%",
                              left: "20%",
                            }}
                          >
                            ✨
                          </motion.div>
                        </>
                      )}
                    </div>

                    {/* Enhanced Exit Button */}
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6, duration: 0.3 }}
                      onClick={() => setShowHint(false)}
                      className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 hover:bg-white border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 z-30 backdrop-blur-sm"
                      aria-label="Close hint"
                    >
                      <span className="text-xs font-bold">✕</span>
                    </motion.button>

                    {/* Achievement-Style Soft Glow */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(circle at center, rgba(255, 215, 0, 0.1) 0%, transparent 70%)",
                        borderRadius: "20px",
                      }}
                    />

                    {/* Main Content */}
                    <div className="relative z-2 flex flex-col items-center gap-1">
                      {/* Word Display on Green Background */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="relative"
                      >
                        {/* Word Display Directly on Green Background */}
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.4, duration: 0.4 }}
                          className="flex items-center justify-center gap-3"
                        >
                          <p
                            className="font-bold flex-1 text-center"
                            style={{
                              fontSize: "1.6rem",
                              color: "white",
                              textShadow:
                                "0 2px 4px rgba(0, 0, 0, 0.4), 0 3px 8px rgba(46, 125, 50, 0.6), 0 1px 2px rgba(46, 125, 50, 0.8)",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {currentWord.word}
                          </p>

                          {/* Speaker Button on Green Background */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6, duration: 0.3 }}
                            className="flex-shrink-0"
                          >
                            <Button
                              onClick={() => playPronunciationDebounced(true)}
                              disabled={isPlaying}
                              size="sm"
                              className={cn(
                                "bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 hover:border-white/50 p-2 rounded-full transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-lg min-w-[36px] h-9",
                                isPlaying &&
                                  "animate-pulse scale-110 bg-white/30",
                                "disabled:opacity-50",
                              )}
                              aria-label="Listen to word pronunciation"
                            >
                              <Volume2
                                className={cn(
                                  "w-4 h-4",
                                  isPlaying && "animate-bounce",
                                )}
                              />
                            </Button>
                          </motion.div>
                        </motion.div>
                      </motion.div>

                      {/* Achievement-Style Celebration Stars */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.3 }}
                        className="flex gap-3 mt-2"
                      >
                        <motion.span
                          animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="text-lg"
                          style={{
                            animationDelay: "0s",
                          }}
                        >
                          ⭐
                        </motion.span>
                        <motion.span
                          animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, -10, 10, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.3,
                          }}
                          className="text-lg"
                          style={{
                            animationDelay: "0.3s",
                          }}
                        >
                          🌟
                        </motion.span>
                        <motion.span
                          animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.6,
                          }}
                          className="text-lg"
                          style={{
                            animationDelay: "0.6s",
                          }}
                        >
                          ��
                        </motion.span>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Word Name and Details */}
            <AnimatePresence>
              {showWordDetails && (
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

                    {/* Single success element - Only if motion allowed */}
                    {!prefersReducedMotion && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: [0, 1, 0],
                          y: [10, -20],
                        }}
                        transition={{
                          duration: 1.5,
                          ease: "easeOut",
                        }}
                        className="absolute top-2 right-4 text-yellow-400 text-sm"
                      >
                        ⭐
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Hint/Definition Display */}
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: 0.7,
                      duration: 0.5,
                      type: "spring",
                      damping: 20,
                    }}
                    className="bg-gradient-to-br from-yellow-50 via-orange-50/50 to-amber-50 border border-yellow-200/60 rounded-xl p-3 text-center shadow-md backdrop-blur-sm ring-1 ring-yellow-200/20"
                    role="region"
                    aria-label="Word hint and definition"
                    aria-live="polite"
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Lightbulb
                        className="w-3 h-3 text-yellow-600"
                        aria-hidden="true"
                      />
                      <h3 className="text-xs font-semibold text-yellow-800">
                        💡 Definition:
                      </h3>
                    </div>
                    <p
                      className="text-yellow-700 text-xs leading-relaxed"
                      id="hint-text"
                    >
                      "{currentWord.definition}"
                    </p>
                    {currentWord.example && (
                      <div className="mt-3 pt-3 border-t border-yellow-200/50">
                        <h4 className="text-xs font-semibold text-yellow-800 mb-1">
                          💬 Example:
                        </h4>
                        <p className="text-yellow-700 text-xs italic leading-relaxed">
                          "{currentWord.example}"
                        </p>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons - Inside card at bottom */}
            {!isAnswered && (
              <div
                className={cn(
                  "space-y-3 sm:space-y-4 px-2 sm:px-0 relative z-30",
                  showHint
                    ? "mt-4 sm:mt-6 md:mt-8" // Reduced margin when hint is active
                    : "mt-36 sm:mt-40 md:mt-40 lg:mt-36 xl:mt-38", // Normal margin when no hint
                )}
                role="group"
                aria-label="Word learning choices"
              >
                <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-sm mx-auto px-2">
                  <Button
                    onClick={() => {
                      // Show hint first if not already shown
                      if (!showHint && !showWordDetails) {
                        handleActionWithFeedback(
                          () => setShowHint(true),
                          "light",
                        );
                      } else {
                        // If hint is already shown, proceed with main functionality
                        handleWordAction("needs_practice");
                      }
                    }}
                    disabled={isAnswered}
                    className={cn(
                      "w-full text-white font-bold border-0 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 py-3 sm:py-4 md:py-6 px-3 sm:px-4 md:px-5 min-h-[60px] sm:min-h-[70px] md:min-h-[80px] relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none touch-manipulation flex flex-col items-center justify-center",
                      "bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 active:from-orange-600 active:to-amber-700",
                      "jungle-button-glow",
                    )}
                    aria-label={
                      showHint
                        ? "Mark as needs practice"
                        : "Get hint for this word"
                    }
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <span className="text-sm sm:text-base mb-0.5 animate-wiggle">
                        {showHint ? "💪" : "💡"}
                      </span>
                      <div className="text-center">
                        <div className="font-bold text-sm sm:text-base md:text-lg leading-tight">
                          {showHint ? "Need Practice" : "Get Hint"}
                        </div>
                        <div className="text-xs opacity-90 mt-0.5 hidden sm:block">
                          {showHint ? "Keep learning!" : "Need help?"}
                        </div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => {
                      // Directly proceed to remember action without showing hint
                      handleWordAction("remembered");
                    }}
                    disabled={isAnswered}
                    className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 active:from-green-600 active:to-emerald-700 text-white font-bold border-0 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 py-3 sm:py-4 md:py-6 px-3 sm:px-4 md:px-5 min-h-[60px] sm:min-h-[70px] md:min-h-[80px] relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none touch-manipulation jungle-button-glow flex flex-col items-center justify-center"
                    aria-label="Mark word as remembered"
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <span className="text-sm sm:text-base mb-0.5 animate-bounce">
                        😊
                      </span>
                      <div className="text-center">
                        <div className="font-bold text-sm sm:text-base md:text-lg leading-tight">
                          I Remember
                        </div>
                        <div className="text-xs opacity-90 mt-0.5 hidden sm:block">
                          Awesome!
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
                        {particle.type === "success" ? "⭐" : "✨"}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
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

      {/* Achievement popups now handled by LightweightAchievementProvider */}
    </div>
  );
}
