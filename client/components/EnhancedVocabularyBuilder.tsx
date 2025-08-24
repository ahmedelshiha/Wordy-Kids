import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  ThumbsUp,
  ThumbsDown,
  SkipForward,
  Trophy,
  Clock,
  Target,
  CheckCircle,
  Volume2,
  Eye,
  Pause,
  Play,
  RotateCcw,
  BookOpen,
  Star,
  Heart,
  Zap,
  Settings,
  Home,
  HelpCircle,
  Accessibility,
  Type,
} from "lucide-react";
import { audioService } from "@/lib/audioService";

interface VocabularyWord {
  id: number;
  word: string;
  pronunciation: string;
  definition: string;
  example: string;
  difficulty: "easy" | "medium" | "hard";
  masteryLevel: number; // 0-100
  lastReviewed?: Date;
  nextReview?: Date;
  category?: string;
  emoji?: string;
}

interface EnhancedVocabularyBuilderProps {
  words: VocabularyWord[];
  onWordMastered: (wordId: number, rating: "easy" | "medium" | "hard") => void;
  onSessionComplete: (wordsReviewed: number, accuracy: number) => void;
  enableAccessibility?: boolean;
  showAdvancedFeatures?: boolean;
  autoPlay?: boolean;
}

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  autoSpeak: boolean;
  showProgress: boolean;
  keyboardShortcuts: boolean;
}

export const EnhancedVocabularyBuilder: React.FC<
  EnhancedVocabularyBuilderProps
> = ({
  words,
  onWordMastered,
  onSessionComplete,
  enableAccessibility = true,
  showAdvancedFeatures = true,
  autoPlay = false,
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [sessionWords, setSessionWords] = useState<VocabularyWord[]>([]);
  const [reviewedWords, setReviewedWords] = useState<number[]>([]);
  const [sessionStartTime] = useState(Date.now());
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [accessibilitySettings, setAccessibilitySettings] =
    useState<AccessibilitySettings>({
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReader: false,
      autoSpeak: false,
      showProgress: true,
      keyboardShortcuts: true,
    });

  // Refs for accessibility
  const mainContentRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLHeadingElement>(null);
  const skipButtonRef = useRef<HTMLButtonElement>(null);
  const easyButtonRef = useRef<HTMLButtonElement>(null);
  const mediumButtonRef = useRef<HTMLButtonElement>(null);
  const hardButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Initialize session with words that need review
    const wordsToReview = words
      .filter((word) => needsReview(word))
      .sort((a, b) => (a.masteryLevel || 0) - (b.masteryLevel || 0))
      .slice(0, 10); // Limit to 10 words per session

    setSessionWords(wordsToReview);
  }, [words]);

  // Enhanced keyboard navigation
  useEffect(() => {
    if (!accessibilitySettings.keyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default only for our shortcuts
      const shortcuts: { [key: string]: () => void } = {
        Space: () => {
          event.preventDefault();
          if (!showDefinition) {
            setShowDefinition(true);
          } else {
            handleRating("medium");
          }
        },
        ArrowLeft: () => {
          event.preventDefault();
          if (showDefinition) handleRating("hard");
        },
        ArrowRight: () => {
          event.preventDefault();
          if (showDefinition) handleRating("easy");
        },
        ArrowUp: () => {
          event.preventDefault();
          if (showDefinition) handleRating("medium");
        },
        KeyS: () => {
          event.preventDefault();
          handleSkip();
        },
        KeyP: () => {
          event.preventDefault();
          if (currentWord) {
            speakWord(currentWord.word);
          }
        },
        KeyR: () => {
          event.preventDefault();
          if (showDefinition) {
            setShowDefinition(false);
          }
        },
        Escape: () => {
          event.preventDefault();
          setIsPaused(!isPaused);
        },
        KeyH: () => {
          event.preventDefault();
          setShowSettings(!showSettings);
        },
      };

      const action = shortcuts[event.code];
      if (action && !isPaused) {
        action();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showDefinition, isPaused, accessibilitySettings.keyboardShortcuts]);

  // Auto-speak functionality
  useEffect(() => {
    if (accessibilitySettings.autoSpeak && currentWord && !showDefinition) {
      const timer = setTimeout(() => {
        speakWord(currentWord.word);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentWordIndex, accessibilitySettings.autoSpeak, showDefinition]);

  // Focus management
  useEffect(() => {
    if (wordRef.current) {
      wordRef.current.focus();
    }
  }, [currentWordIndex]);

  // Screen reader announcements
  const announceToScreenReader = useCallback(
    (message: string) => {
      if (!accessibilitySettings.screenReader) return;

      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.volume = 0.5;
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
      }
    },
    [accessibilitySettings.screenReader],
  );

  const speakWord = useCallback((word: string) => {
    audioService.pronounceWord(word, {
      onStart: () => console.log("Speaking:", word),
      onEnd: () => console.log("Finished speaking"),
      onError: () => console.log("Error speaking word"),
    });
  }, []);

  const needsReview = (word: VocabularyWord): boolean => {
    if (!word.lastReviewed) return true;
    if (!word.nextReview) return true;
    return new Date() >= new Date(word.nextReview);
  };

  const calculateNextReview = (
    masteryLevel: number,
    rating: "easy" | "medium" | "hard",
  ): Date => {
    const now = new Date();
    let intervalDays = 1;

    // Enhanced spaced repetition algorithm
    if (rating === "easy") {
      intervalDays = Math.max(1, Math.floor(masteryLevel / 10) * 2);
    } else if (rating === "medium") {
      intervalDays = Math.max(1, Math.floor(masteryLevel / 20));
    } else {
      intervalDays = 1; // Review again tomorrow if hard
    }

    const nextReview = new Date(now);
    nextReview.setDate(now.getDate() + intervalDays);
    return nextReview;
  };

  const handleRating = (rating: "easy" | "medium" | "hard") => {
    const currentWord = sessionWords[currentWordIndex];
    if (!currentWord) return;

    // Haptic feedback
    if ("vibrate" in navigator) {
      const vibrationPattern = {
        easy: [50, 50, 50],
        medium: [100],
        hard: [200, 100, 200],
      };
      navigator.vibrate(vibrationPattern[rating]);
    }

    // Screen reader announcement
    announceToScreenReader(
      `Rated as ${rating}. ${
        currentWordIndex < sessionWords.length - 1
          ? "Moving to next word."
          : "Session complete!"
      }`,
    );

    // Update mastery level
    let newMasteryLevel = currentWord.masteryLevel || 0;
    if (rating === "easy") {
      newMasteryLevel = Math.min(100, newMasteryLevel + 15);
    } else if (rating === "medium") {
      newMasteryLevel = Math.min(100, newMasteryLevel + 8);
    } else {
      newMasteryLevel = Math.max(0, newMasteryLevel - 5);
    }

    onWordMastered(currentWord.id, rating);
    setReviewedWords([...reviewedWords, currentWord.id]);

    // Move to next word or complete session
    if (currentWordIndex < sessionWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setShowDefinition(false);
    } else {
      completeSession();
    }
  };

  const handleSkip = () => {
    announceToScreenReader("Word skipped. Moving to next word.");

    if (currentWordIndex < sessionWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setShowDefinition(false);
    } else {
      completeSession();
    }
  };

  const completeSession = () => {
    setSessionComplete(true);
    const timeSpent = Math.round((Date.now() - sessionStartTime) / 1000);
    const accuracy = (reviewedWords.length / sessionWords.length) * 100;

    announceToScreenReader(
      `Session completed! You reviewed ${reviewedWords.length} words with ${Math.round(accuracy)}% completion rate.`,
    );

    setTimeout(() => onSessionComplete(reviewedWords.length, accuracy), 2000);
  };

  const toggleAccessibilitySetting = (setting: keyof AccessibilitySettings) => {
    setAccessibilitySettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  if (sessionWords.length === 0) {
    return (
      <Card
        className={`max-w-2xl mx-auto ${accessibilitySettings.highContrast ? "bg-black text-white border-white" : ""}`}
      >
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2
            className={`text-2xl font-bold mb-4 ${
              accessibilitySettings.largeText ? "text-4xl" : "text-2xl"
            } ${accessibilitySettings.highContrast ? "text-white" : "text-slate-800"}`}
          >
            Great Job! 🎉
          </h2>
          <p
            className={`mb-6 ${
              accessibilitySettings.largeText ? "text-xl" : "text-base"
            } ${accessibilitySettings.highContrast ? "text-white" : "text-slate-600"}`}
          >
            You've reviewed all your words for today. Come back tomorrow for
            more practice!
          </p>
          <Badge className="bg-green-500 text-white">All words reviewed</Badge>
        </CardContent>
      </Card>
    );
  }

  if (sessionComplete) {
    const accuracy = Math.round(
      (reviewedWords.length / sessionWords.length) * 100,
    );
    const timeSpent = Math.round((Date.now() - sessionStartTime) / 1000);

    return (
      <Card
        className={`max-w-2xl mx-auto ${
          accessibilitySettings.highContrast
            ? "bg-black text-white border-white"
            : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
        }`}
      >
        <CardContent className="p-8 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4" />
          <h2
            className={`font-bold mb-4 ${
              accessibilitySettings.largeText ? "text-4xl" : "text-3xl"
            }`}
          >
            Session Complete! 🎉
          </h2>
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <div
                className={`font-bold ${
                  accessibilitySettings.largeText ? "text-3xl" : "text-2xl"
                }`}
              >
                {reviewedWords.length}
              </div>
              <div
                className={`opacity-90 ${
                  accessibilitySettings.largeText ? "text-lg" : "text-sm"
                }`}
              >
                Words Reviewed
              </div>
            </div>
            <div>
              <div
                className={`font-bold ${
                  accessibilitySettings.largeText ? "text-3xl" : "text-2xl"
                }`}
              >
                {accuracy}%
              </div>
              <div
                className={`opacity-90 ${
                  accessibilitySettings.largeText ? "text-lg" : "text-sm"
                }`}
              >
                Completion Rate
              </div>
            </div>
            <div>
              <div
                className={`font-bold ${
                  accessibilitySettings.largeText ? "text-3xl" : "text-2xl"
                }`}
              >
                {Math.floor(timeSpent / 60)}m
              </div>
              <div
                className={`opacity-90 ${
                  accessibilitySettings.largeText ? "text-lg" : "text-sm"
                }`}
              >
                Time Spent
              </div>
            </div>
          </div>
          <p
            className={`opacity-90 ${
              accessibilitySettings.largeText ? "text-xl" : "text-lg"
            }`}
          >
            Keep up the great work! Your vocabulary is growing stronger every
            day.
          </p>

          <div className="flex gap-4 justify-center mt-6">
            <Button
              onClick={() => window.location.reload()}
              className={`min-h-[48px] px-6 ${
                accessibilitySettings.highContrast
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-slate-800/80 text-white hover:bg-slate-700/90 border border-white/20"
              }`}
              aria-label="Start new session"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              New Session
            </Button>
            <Button
              onClick={() => window.history.back()}
              className={`min-h-[48px] px-6 ${
                accessibilitySettings.highContrast
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-slate-800/80 text-white hover:bg-slate-700/90 border border-white/20"
              }`}
              aria-label="Return to word library"
            >
              <Home className="w-5 h-5 mr-2" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentWord = sessionWords[currentWordIndex];
  const progress = ((currentWordIndex + 1) / sessionWords.length) * 100;

  return (
    <div
      className={`max-w-4xl mx-auto space-y-6 p-4 ${
        accessibilitySettings.highContrast ? "bg-black" : ""
      }`}
      ref={mainContentRef}
    >
      {/* Accessibility Settings Panel */}
      {showSettings && enableAccessibility && (
        <Card
          className={`${accessibilitySettings.highContrast ? "bg-gray-900 text-white border-white" : ""}`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Accessibility className="w-5 h-5" />
              Accessibility Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accessibilitySettings.highContrast}
                  onChange={() => toggleAccessibilitySetting("highContrast")}
                  className="w-4 h-4"
                />
                <span>High Contrast Mode</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accessibilitySettings.largeText}
                  onChange={() => toggleAccessibilitySetting("largeText")}
                  className="w-4 h-4"
                />
                <span>Large Text</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accessibilitySettings.reducedMotion}
                  onChange={() => toggleAccessibilitySetting("reducedMotion")}
                  className="w-4 h-4"
                />
                <span>Reduced Motion</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accessibilitySettings.screenReader}
                  onChange={() => toggleAccessibilitySetting("screenReader")}
                  className="w-4 h-4"
                />
                <span>Screen Reader Support</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accessibilitySettings.autoSpeak}
                  onChange={() => toggleAccessibilitySetting("autoSpeak")}
                  className="w-4 h-4"
                />
                <span>Auto-Speak Words</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accessibilitySettings.keyboardShortcuts}
                  onChange={() =>
                    toggleAccessibilitySetting("keyboardShortcuts")
                  }
                  className="w-4 h-4"
                />
                <span>Keyboard Shortcuts</span>
              </label>
            </div>

            {accessibilitySettings.keyboardShortcuts && (
              <div
                className={`mt-4 p-4 rounded-lg ${
                  accessibilitySettings.highContrast
                    ? "bg-gray-800"
                    : "bg-gray-50"
                }`}
              >
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Keyboard Shortcuts
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <kbd className="px-2 py-1 bg-gray-200 text-gray-800 rounded">
                      Space
                    </kbd>{" "}
                    Show definition / Rate as medium
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-gray-200 text-gray-800 rounded">
                      ←
                    </kbd>{" "}
                    Rate as hard
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-gray-200 text-gray-800 rounded">
                      →
                    </kbd>{" "}
                    Rate as easy
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-gray-200 text-gray-800 rounded">
                      ↑
                    </kbd>{" "}
                    Rate as medium
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-gray-200 text-gray-800 rounded">
                      S
                    </kbd>{" "}
                    Skip word
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-gray-200 text-gray-800 rounded">
                      P
                    </kbd>{" "}
                    Pronounce word
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-gray-200 text-gray-800 rounded">
                      R
                    </kbd>{" "}
                    Return to word
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-gray-200 text-gray-800 rounded">
                      Esc
                    </kbd>{" "}
                    Pause session
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Session Header */}
      <Card
        className={`${accessibilitySettings.highContrast ? "bg-gray-900 text-white border-white" : ""}`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-educational-purple" />
              Vocabulary Builder Session
              {isPaused && (
                <Badge variant="outline" className="ml-2">
                  Paused
                </Badge>
              )}
            </CardTitle>

            <div className="flex gap-2">
              {enableAccessibility && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSettings(!showSettings)}
                  className="min-h-[44px] min-w-[44px]"
                  aria-label="Toggle accessibility settings"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPaused(!isPaused)}
                className="min-h-[44px] min-w-[44px]"
                aria-label={isPaused ? "Resume session" : "Pause session"}
              >
                {isPaused ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => speakWord(currentWord.word)}
                className="min-h-[44px] min-w-[44px]"
                aria-label="Pronounce current word"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <Badge
                variant="outline"
                className={
                  accessibilitySettings.largeText ? "text-lg px-4 py-2" : ""
                }
              >
                Word {currentWordIndex + 1} of {sessionWords.length}
              </Badge>
              <Badge
                variant="outline"
                className={
                  accessibilitySettings.largeText ? "text-lg px-4 py-2" : ""
                }
              >
                Mastery: {currentWord.masteryLevel || 0}%
              </Badge>
              {currentWord.category && (
                <Badge
                  variant="outline"
                  className={
                    accessibilitySettings.largeText ? "text-lg px-4 py-2" : ""
                  }
                >
                  {currentWord.category}
                </Badge>
              )}
            </div>
            <Badge className="bg-educational-purple text-white">
              <Clock className="w-4 h-4 mr-1" />
              {Math.floor((Date.now() - sessionStartTime) / 1000 / 60)}m
            </Badge>
          </div>

          {accessibilitySettings.showProgress && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress
                value={progress}
                className="h-2"
                aria-label={`Session progress: ${Math.round(progress)}%`}
              />
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Pause Overlay */}
      {isPaused && (
        <Card
          className={`${accessibilitySettings.highContrast ? "bg-gray-900 text-white border-white" : "bg-gray-50"}`}
        >
          <CardContent className="p-8 text-center">
            <Pause className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3
              className={`font-bold mb-2 ${accessibilitySettings.largeText ? "text-2xl" : "text-xl"}`}
            >
              Session Paused
            </h3>
            <p
              className={`text-gray-600 mb-4 ${accessibilitySettings.largeText ? "text-lg" : ""}`}
            >
              Take a break! Resume when you're ready.
            </p>
            <Button
              onClick={() => setIsPaused(false)}
              className="min-h-[48px] px-6"
            >
              <Play className="w-5 h-5 mr-2" />
              Resume Session
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Word Card */}
      {!isPaused && (
        <Card
          className={`relative overflow-hidden ${
            accessibilitySettings.highContrast
              ? "bg-gray-900 text-white border-white"
              : ""
          }`}
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink" />

          <CardContent className="p-8">
            {!showDefinition ? (
              /* Show Word First */
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    {currentWord.emoji && (
                      <span
                        className={
                          accessibilitySettings.largeText
                            ? "text-8xl"
                            : "text-6xl"
                        }
                      >
                        {currentWord.emoji}
                      </span>
                    )}
                  </div>

                  <h1
                    ref={wordRef}
                    className={`font-bold tracking-wide ${
                      accessibilitySettings.largeText ? "text-7xl" : "text-5xl"
                    } ${accessibilitySettings.highContrast ? "text-white" : "text-slate-800"}`}
                    tabIndex={-1}
                    aria-live="polite"
                  >
                    {currentWord.word}
                  </h1>

                  <div className="flex items-center justify-center gap-4">
                    <p
                      className={`${
                        accessibilitySettings.largeText ? "text-2xl" : "text-xl"
                      } ${accessibilitySettings.highContrast ? "text-gray-300" : "text-slate-600"}`}
                    >
                      {currentWord.pronunciation}
                    </p>

                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => speakWord(currentWord.word)}
                      className="min-h-[48px] min-w-[48px] rounded-full"
                      aria-label={`Pronounce ${currentWord.word}`}
                    >
                      <Volume2 className="w-6 h-6" />
                    </Button>
                  </div>

                  <Badge
                    className={`px-4 py-2 ${
                      accessibilitySettings.largeText ? "text-lg" : "text-base"
                    } ${
                      currentWord.difficulty === "easy"
                        ? "bg-educational-green"
                        : currentWord.difficulty === "medium"
                          ? "bg-educational-orange"
                          : "bg-educational-pink"
                    } text-white`}
                  >
                    {currentWord.difficulty}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <p
                    className={`${
                      accessibilitySettings.largeText ? "text-xl" : "text-lg"
                    } ${accessibilitySettings.highContrast ? "text-gray-300" : "text-slate-600"}`}
                  >
                    Do you remember what this word means?
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      onClick={() => {
                        setShowDefinition(true);
                        announceToScreenReader(
                          `Showing definition for ${currentWord.word}`,
                        );
                      }}
                      className={`bg-educational-blue text-white hover:bg-educational-blue/90 min-h-[48px] px-8 ${
                        accessibilitySettings.largeText ? "text-xl py-4" : ""
                      }`}
                      aria-describedby="show-definition-hint"
                    >
                      <BookOpen className="w-5 h-5 mr-2" />
                      Show Definition
                    </Button>

                    <Button
                      ref={skipButtonRef}
                      size="lg"
                      variant="outline"
                      onClick={handleSkip}
                      className={`min-h-[48px] px-8 ${
                        accessibilitySettings.largeText ? "text-xl py-4" : ""
                      } ${accessibilitySettings.highContrast ? "border-white text-white hover:bg-white hover:text-black" : ""}`}
                      aria-label="Skip this word"
                    >
                      <SkipForward className="w-5 h-5 mr-2" />
                      Skip
                    </Button>
                  </div>

                  <p
                    id="show-definition-hint"
                    className={`text-xs opacity-75 ${
                      accessibilitySettings.largeText ? "text-sm" : ""
                    }`}
                  >
                    Press Space to show definition, or S to skip
                  </p>
                </div>
              </div>
            ) : (
              /* Show Definition and Rating */
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    {currentWord.emoji && (
                      <span
                        className={
                          accessibilitySettings.largeText
                            ? "text-6xl"
                            : "text-4xl"
                        }
                      >
                        {currentWord.emoji}
                      </span>
                    )}
                    <h1
                      className={`font-bold ${
                        accessibilitySettings.largeText
                          ? "text-5xl"
                          : "text-4xl"
                      } ${accessibilitySettings.highContrast ? "text-white" : "text-slate-800"}`}
                    >
                      {currentWord.word}
                    </h1>
                  </div>

                  <div
                    className={`rounded-lg p-6 space-y-4 ${
                      accessibilitySettings.highContrast
                        ? "bg-gray-800"
                        : "bg-slate-50"
                    }`}
                  >
                    <div>
                      <h3
                        className={`font-semibold mb-2 ${
                          accessibilitySettings.largeText
                            ? "text-xl"
                            : "text-lg"
                        } ${accessibilitySettings.highContrast ? "text-gray-300" : "text-slate-700"}`}
                      >
                        Definition:
                      </h3>
                      <p
                        className={`${
                          accessibilitySettings.largeText
                            ? "text-2xl"
                            : "text-xl"
                        } ${accessibilitySettings.highContrast ? "text-white" : "text-slate-800"}`}
                      >
                        {currentWord.definition}
                      </p>
                    </div>

                    <div>
                      <h3
                        className={`font-semibold mb-2 ${
                          accessibilitySettings.largeText
                            ? "text-xl"
                            : "text-lg"
                        } ${accessibilitySettings.highContrast ? "text-gray-300" : "text-slate-700"}`}
                      >
                        Example:
                      </h3>
                      <p
                        className={`italic ${
                          accessibilitySettings.largeText
                            ? "text-xl"
                            : "text-lg"
                        } ${accessibilitySettings.highContrast ? "text-gray-300" : "text-slate-600"}`}
                      >
                        "{currentWord.example}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <h3
                    className={`font-semibold ${
                      accessibilitySettings.largeText ? "text-2xl" : "text-xl"
                    } ${accessibilitySettings.highContrast ? "text-white" : "text-slate-800"}`}
                  >
                    How well did you remember this word?
                  </h3>

                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button
                      ref={hardButtonRef}
                      onClick={() => handleRating("hard")}
                      variant="outline"
                      className={`flex-1 max-w-xs min-h-[60px] flex flex-col gap-1 text-red-600 border-red-300 hover:bg-red-50 ${
                        accessibilitySettings.largeText ? "text-lg py-4" : ""
                      } ${accessibilitySettings.highContrast ? "border-red-400 text-red-400 hover:bg-red-900" : ""}`}
                      aria-label="Rate as hard - will review tomorrow"
                      aria-describedby="hard-rating-description"
                    >
                      <div className="flex items-center gap-2">
                        <ThumbsDown className="w-5 h-5" />
                        <span className="font-semibold">Hard</span>
                      </div>
                      <div
                        className={`text-xs ${accessibilitySettings.largeText ? "text-sm" : ""}`}
                      >
                        Review tomorrow
                      </div>
                    </Button>

                    <Button
                      ref={mediumButtonRef}
                      onClick={() => handleRating("medium")}
                      variant="outline"
                      className={`flex-1 max-w-xs min-h-[60px] flex flex-col gap-1 text-yellow-600 border-yellow-300 hover:bg-yellow-50 ${
                        accessibilitySettings.largeText ? "text-lg py-4" : ""
                      } ${accessibilitySettings.highContrast ? "border-yellow-400 text-yellow-400 hover:bg-yellow-900" : ""}`}
                      aria-label="Rate as medium - will review in a few days"
                      aria-describedby="medium-rating-description"
                    >
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        <span className="font-semibold">Medium</span>
                      </div>
                      <div
                        className={`text-xs ${accessibilitySettings.largeText ? "text-sm" : ""}`}
                      >
                        Review in few days
                      </div>
                    </Button>

                    <Button
                      ref={easyButtonRef}
                      onClick={() => handleRating("easy")}
                      variant="outline"
                      className={`flex-1 max-w-xs min-h-[60px] flex flex-col gap-1 text-green-600 border-green-300 hover:bg-green-50 ${
                        accessibilitySettings.largeText ? "text-lg py-4" : ""
                      } ${accessibilitySettings.highContrast ? "border-green-400 text-green-400 hover:bg-green-900" : ""}`}
                      aria-label="Rate as easy - will review next week"
                      aria-describedby="easy-rating-description"
                    >
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="w-5 h-5" />
                        <span className="font-semibold">Easy</span>
                      </div>
                      <div
                        className={`text-xs ${accessibilitySettings.largeText ? "text-sm" : ""}`}
                      >
                        Review next week
                      </div>
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={handleSkip}
                      variant="ghost"
                      className={`min-h-[48px] ${
                        accessibilitySettings.largeText ? "text-lg py-4" : ""
                      } ${accessibilitySettings.highContrast ? "text-white hover:bg-gray-800" : "text-slate-500"}`}
                      aria-label="Skip this word without rating"
                    >
                      <SkipForward className="w-4 h-4 mr-2" />
                      Skip this word
                    </Button>

                    <Button
                      onClick={() => setShowDefinition(false)}
                      variant="ghost"
                      className={`min-h-[48px] ${
                        accessibilitySettings.largeText ? "text-lg py-4" : ""
                      } ${accessibilitySettings.highContrast ? "text-white hover:bg-gray-800" : "text-slate-500"}`}
                      aria-label="Return to word view"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Back to word
                    </Button>
                  </div>

                  {accessibilitySettings.keyboardShortcuts && (
                    <p
                      className={`text-xs opacity-75 ${
                        accessibilitySettings.largeText ? "text-sm" : ""
                      }`}
                    >
                      Use ← for Hard, ↑ for Medium, → for Easy, or S to Skip
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Hidden descriptions for screen readers */}
      <div className="sr-only">
        <div id="hard-rating-description">
          Rating a word as hard will schedule it for review tomorrow and
          decrease its mastery level.
        </div>
        <div id="medium-rating-description">
          Rating a word as medium will schedule it for review in a few days and
          moderately increase its mastery level.
        </div>
        <div id="easy-rating-description">
          Rating a word as easy will schedule it for review next week and
          significantly increase its mastery level.
        </div>
      </div>

      {/* Live region for announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {/* Current word announcement for screen readers */}
        Word {currentWordIndex + 1} of {sessionWords.length}: {currentWord.word}
        {showDefinition && `. Definition: ${currentWord.definition}`}
        {isPaused && ". Session is paused."}
      </div>
    </div>
  );
};
