import React, { useState, useEffect } from "react";
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
}: InteractiveDashboardWordCardProps) {
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

  // Initialize session with 20 words from available words
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
      console.log(`New session started with ${sessionWordSet.length} words`);
    }
  }, [words]);

  const currentWord = sessionWords[currentWordIndex] || null;
  const sessionProgress = Math.round(
    (sessionStats.wordsCompleted / SESSION_SIZE) * 100,
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
  }, [currentWordIndex]);

  const playPronunciation = () => {
    if (currentWord && !isPlaying) {
      setIsPlaying(true);
      audioService.pronounceWord(currentWord.word, {
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
      audioService.playSuccessSound();
      setTimeout(() => setCelebrationEffect(false), 2000);
    } else if (status === "needs_practice") {
      audioService.playEncouragementSound();
    }

    try {
      // Call the progress callback for overall tracking
      await onWordProgress(currentWord, status);
      console.log(`Word progress callback completed for: ${currentWord.word}`);
      console.log(
        `Session progress: ${newStats.wordsCompleted}/${SESSION_SIZE}, Accuracy: ${newStats.accuracy}%`,
      );
    } catch (error) {
      console.error("Error in word progress callback:", error);
    }

    // Check if session is complete
    if (newStats.wordsCompleted >= SESSION_SIZE) {
      const achievements = checkSessionAchievements(newStats);
      setSessionAchievements(achievements);
      setShowSessionComplete(true);

      console.log("Session completed!", {
        stats: newStats,
        achievements: achievements.map((a) => a.title),
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

    // Reset states for next word
    setIsAnswered(false);
    setFeedbackType(null);
    setCelebrationEffect(false);

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
  };

  const startNewSession = () => {
    console.log("Starting new session...");

    // Reset all session state
    setShowSessionComplete(false);
    setSessionAchievements([]);
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

    // Request new words for next session
    if (onRequestNewWords) {
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
        <img
          src={currentWord.imageUrl}
          alt="Picture to guess"
          className="w-full h-64 object-cover rounded-2xl shadow-lg"
        />
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
          <div
            className={`w-48 h-32 mx-auto flex flex-col items-center justify-center bg-gradient-to-br ${feedbackColor} rounded-2xl shadow-lg border-2 ${feedbackType === "remembered" ? "border-green-300" : "border-orange-300"} transition-all duration-500`}
          >
            <div className="text-4xl animate-bounce mb-1">{feedbackEmoji}</div>
            <div className="text-xs font-bold text-gray-700">
              {feedbackMessage}
            </div>
          </div>
        );
      }

      return (
        <div className="w-48 h-32 mx-auto flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl shadow-lg">
          <div className="text-8xl animate-gentle-float filter drop-shadow-lg">
            {currentWord.emoji}
          </div>
        </div>
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
    <div className={cn("space-y-6", className)}>
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

      {/* Daily Goal Header - Hidden */}
      {/* <div className="text-center bg-gradient-to-r from-educational-blue to-educational-purple text-white p-4 rounded-2xl shadow-lg">
        <div className="flex items-center justify-center gap-4 mb-3">
          <Target className="w-6 h-6" />
          <h2 className="text-lg font-bold">
            Today's Goal: Learn {dailyGoal.target} words ({dailyGoal.completed}/
            {dailyGoal.target})
          </h2>
          <div className="flex items-center gap-1">
            <Zap className="w-5 h-5 text-yellow-300" />
            <span className="font-bold">{dailyGoal.streak}</span>
          </div>
        </div>
        <Progress value={dailyProgress} className="h-3 bg-white/20" />
        <p className="text-sm mt-2 opacity-90">{dailyProgress}% complete</p>
      </div> */}

      {/* Interactive Word Card */}
      <Card
        className={cn(
          "w-full max-w-3xl mx-auto transition-all duration-500 transform hover:scale-[1.02] relative overflow-hidden",
          celebrationEffect &&
            "animate-pulse shadow-2xl border-yellow-400 border-4",
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

        <CardContent className="p-8 relative z-10">
          {/* Category and Progress Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Badge
                className={cn(
                  "text-sm px-3 py-1",
                  getDifficultyColor(currentWord.difficulty),
                )}
              >
                {currentWord.category}
              </Badge>
              {/* Hidden: Word progress and Session progress badges */}
              <Badge
                variant="outline"
                className="text-sm px-3 py-1 bg-purple-50 text-purple-700 border-purple-300"
              >
                {sessionStats.accuracy}% Accuracy
              </Badge>
            </div>
          </div>

          {/* Picture Display */}
          <div className="mb-6">{renderWordImage()}</div>

          {/* Game Instructions */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              🎯 What is this?
            </h2>
            <p className="text-gray-600">
              Look at the picture and guess the word!
            </p>
          </div>

          {/* Pronunciation Button */}
          <div className="flex justify-center gap-4 mb-6">
            <Button
              onClick={playPronunciation}
              disabled={isPlaying}
              className="bg-educational-blue hover:bg-educational-blue/90 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              <Volume2
                className={cn("w-6 h-6", isPlaying && "animate-pulse")}
              />
            </Button>

            {!showHint && !showWordName && (
              <Button
                onClick={() => setShowHint(true)}
                variant="outline"
                className="px-6 py-3 text-lg rounded-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Lightbulb className="w-5 h-5 mr-2" />
                Hint
              </Button>
            )}
          </div>

          {/* Hint Display */}
          {showHint && !showWordName && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 mb-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-yellow-800">Hint:</h3>
              </div>
              <p className="text-yellow-700 text-lg">
                "{currentWord.definition}"
              </p>
            </div>
          )}

          {/* Show Word Name Button */}
          {!showWordName && (
            <div className="text-center mb-6">
              <Button
                onClick={() => setShowWordName(true)}
                className="bg-educational-purple hover:bg-educational-purple/90 text-white px-8 py-3 text-lg rounded-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Eye className="w-5 h-5 mr-2" />
                👁️ Show Word Name
              </Button>
            </div>
          )}

          {/* Word Name and Details */}
          {showWordName && (
            <div className="space-y-4 mb-8">
              {/* Word Name */}
              <div className="text-center bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-2xl border-2 border-green-200">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="text-3xl">{currentWord.emoji}</div>
                  <h1 className="text-lg md:text-xl font-bold text-gray-800 tracking-wide">
                    {currentWord.word.toUpperCase()}
                  </h1>
                  <div className="text-3xl">{currentWord.emoji}</div>
                </div>

                {/* Pronunciation */}
                {currentWord.pronunciation && (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg text-gray-600 font-mono">
                      /{currentWord.pronunciation}/
                    </span>
                  </div>
                )}
              </div>

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
            </div>
          )}

          {/* Action Buttons - Always visible */}
          {!isAnswered && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleWordAction("needs_practice")}
                  variant="outline"
                  disabled={isAnswered}
                  className="flex-1 bg-gradient-to-br from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 border-2 border-red-300 hover:border-red-400 text-red-700 hover:text-red-800 transition-all duration-300 transform hover:scale-110 hover:rotate-1 py-4 px-3 rounded-3xl shadow-lg hover:shadow-xl animate-kid-float disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <XCircle className="w-4 h-4 mr-1 md:w-6 md:h-6 md:mr-2" />
                  <div className="text-center">
                    <div className="font-bold text-xs">😔 I Forgot</div>
                    <div className="text-xs opacity-75 mt-0.5">Try again!</div>
                  </div>
                </Button>

                <Button
                  onClick={() => handleWordAction("remembered")}
                  disabled={isAnswered}
                  className="flex-1 bg-gradient-to-br from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 border-2 border-green-300 hover:border-green-400 text-green-700 hover:text-green-800 transition-all duration-300 transform hover:scale-110 hover:-rotate-1 py-4 px-3 rounded-3xl shadow-lg hover:shadow-xl animate-kid-float-delayed disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <CheckCircle className="w-4 h-4 mr-1 md:w-6 md:h-6 md:mr-2" />
                  <div className="text-center">
                    <div className="font-bold text-xs">😊 I Remember</div>
                    <div className="text-xs opacity-75 mt-0.5">Awesome!</div>
                  </div>
                </Button>
              </div>

              {/* Skip button (smaller, less prominent) */}
              <div className="text-center">
                <Button
                  onClick={() => handleWordAction("skipped")}
                  variant="ghost"
                  size="sm"
                  disabled={isAnswered}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip this word
                </Button>
              </div>

              {/* Session Progress Display */}
              <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-200">
                {/* Session Progress Header */}
                <div className="text-center mb-3">
                  <div className="text-sm text-gray-700 font-bold">
                    Session Progress
                  </div>
                  <div className="text-xs text-gray-600">
                    {sessionStats.wordsCompleted} / {SESSION_SIZE} words
                    completed
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(sessionStats.wordsCompleted / SESSION_SIZE) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  {/* Session Remembered */}
                  <div className="bg-green-100 rounded-lg p-2 border border-green-300 text-center flex-1">
                    <div className="text-lg">✅</div>
                    <div className="text-lg font-bold text-green-700">
                      {sessionStats.wordsRemembered}
                    </div>
                    <div className="text-xs text-green-600 font-medium">
                      This Session
                    </div>
                  </div>

                  {/* Session Practice */}
                  <div className="bg-orange-100 rounded-lg p-2 border border-orange-300 text-center flex-1">
                    <div className="text-lg">💪</div>
                    <div className="text-lg font-bold text-orange-700">
                      {sessionStats.wordsForgotten}
                    </div>
                    <div className="text-xs text-orange-600 font-medium">
                      To Practice
                    </div>
                  </div>
                </div>

                {/* Session encouraging message */}
                <div className="mt-3 text-center">
                  {sessionStats.wordsRemembered >= 15 ? (
                    <div className="text-green-600 font-medium text-xs">
                      🌟 Outstanding! {sessionStats.wordsRemembered} words
                      mastered!
                    </div>
                  ) : sessionStats.wordsRemembered >= 10 ? (
                    <div className="text-green-600 font-medium text-xs">
                      🎯 Great progress! You're doing amazing!
                    </div>
                  ) : sessionStats.wordsCompleted >= 10 ? (
                    <div className="text-blue-600 font-medium text-xs">
                      🔥 Halfway there! Keep going strong!
                    </div>
                  ) : (
                    <div className="text-purple-600 font-medium text-xs">
                      🎯 Great start! Every word counts!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading next word indicator */}
          {isAnswered && (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-educational-purple mx-auto mb-2"></div>
              <p className="text-gray-600">Loading next word...</p>
            </div>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
