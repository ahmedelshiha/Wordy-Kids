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
}: InteractiveDashboardWordCardProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showWordName, setShowWordName] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [celebrationEffect, setCelebrationEffect] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedbackType, setFeedbackType] = useState<
    "remembered" | "needs_practice" | null
  >(null);
  const [guess, setGuess] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [shownWordIds, setShownWordIds] = useState<Set<number>>(new Set());
  const [localRememberedCount, setLocalRememberedCount] = useState(0);
  const [localForgottenCount, setLocalForgottenCount] = useState(0);
  const [achievementMessage, setAchievementMessage] = useState<string | null>(null);

  const currentWord = words[currentWordIndex] || null;
  const dailyProgress = Math.round(
    (dailyGoal.completed / dailyGoal.target) * 100,
  );

  // Debug logging for progress tracking
  useEffect(() => {
    console.log(`Daily Goal Progress: ${dailyGoal.completed}/${dailyGoal.target} (${dailyProgress}%)`);
    console.log(`Current word index: ${currentWordIndex}/${words.length}`);
    console.log(`Shown words: ${shownWordIds.size}`);
  }, [dailyGoal.completed, dailyGoal.target, currentWordIndex, words.length, shownWordIds.size]);

  // Auto-advance to next word when words array changes
  useEffect(() => {
    if (words.length > 0 && currentWordIndex >= words.length) {
      setCurrentWordIndex(0);
    }

    // Reset shown words tracking when word array changes (new set of words)
    if (words.length > 0) {
      setShownWordIds(new Set());
    }
  }, [words, currentWordIndex]);

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

  const checkForAchievements = (remembered: number, forgotten: number) => {
    const total = remembered + forgotten;
    const accuracy = total > 0 ? Math.round((remembered / total) * 100) : 0;

    // Milestone achievements
    if (remembered === 5) {
      setAchievementMessage("🌟 First 5 words! You're on fire!");
      setTimeout(() => setAchievementMessage(null), 3000);
    } else if (remembered === 10) {
      setAchievementMessage("🎯 10 words mastered! Amazing!");
      setTimeout(() => setAchievementMessage(null), 3000);
    } else if (remembered === 20) {
      setAchievementMessage("🏆 20 words! You're a vocabulary champion!");
      setTimeout(() => setAchievementMessage(null), 3000);
    } else if (remembered === 50) {
      setAchievementMessage("⭐ 50 words! Absolutely incredible!");
      setTimeout(() => setAchievementMessage(null), 3000);
    }

    // Accuracy achievements
    if (total >= 10 && accuracy === 100) {
      setAchievementMessage("💯 Perfect score! No mistakes!");
      setTimeout(() => setAchievementMessage(null), 3000);
    } else if (total >= 10 && accuracy >= 90) {
      setAchievementMessage("🎉 90%+ accuracy! Excellent work!");
      setTimeout(() => setAchievementMessage(null), 3000);
    }
  };

  const handleWordAction = async (
    status: "remembered" | "needs_practice" | "skipped",
  ) => {
    if (!currentWord || isAnswered) return;

    console.log(`Word Action: ${currentWord.word} - ${status}`, {
      wordId: currentWord.id,
      currentIndex: currentWordIndex,
      totalWords: words.length,
      localRemembered: localRememberedCount,
      localForgotten: localForgottenCount
    });

    // Mark as answered immediately to prevent double-clicks
    setIsAnswered(true);

    // Update local counters
    if (status === "remembered") {
      setLocalRememberedCount(prev => {
        const newCount = prev + 1;
        checkForAchievements(newCount, localForgottenCount);
        return newCount;
      });
    } else if (status === "needs_practice") {
      setLocalForgottenCount(prev => prev + 1);
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
      // Call the progress callback and wait for it to complete
      await onWordProgress(currentWord, status);
      console.log(`Word progress callback completed for: ${currentWord.word}`);
      console.log(`Local progress: ${localRememberedCount + (status === "remembered" ? 1 : 0)} remembered, ${localForgottenCount + (status === "needs_practice" ? 1 : 0)} forgotten`);
    } catch (error) {
      console.error('Error in word progress callback:', error);
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
    console.log(`Advancing from word ${currentWordIndex + 1}/${words.length}`);

    // Reset states for next word
    setIsAnswered(false);
    setFeedbackType(null);
    setCelebrationEffect(false);

    // Mark current word as shown
    if (currentWord) {
      setShownWordIds((prev) => {
        const newSet = new Set([...prev, currentWord.id]);
        console.log(`Marked word ${currentWord.id} as shown. Total shown: ${newSet.size}`);
        return newSet;
      });
    }

    // Calculate how many words we've shown vs available
    const totalShown = shownWordIds.size + (currentWord ? 1 : 0);
    const wordsRemaining = words.length - totalShown;

    console.log(`Words status: ${totalShown} shown, ${wordsRemaining} remaining, ${words.length} total`);

    // If we've shown most words in current set (80% or more), request new words
    if (wordsRemaining <= Math.max(1, Math.floor(words.length * 0.2))) {
      console.log('Requesting new words - running low on current set');
      if (onRequestNewWords) {
        onRequestNewWords();
        // Reset tracking and start fresh
        setShownWordIds(new Set());
        setCurrentWordIndex(0);
        return;
      }
    }

    // Find next unseen word
    let nextIndex = currentWordIndex + 1;
    let foundUnseen = false;

    // Search for next unseen word in current set
    for (let i = nextIndex; i < words.length; i++) {
      if (!shownWordIds.has(words[i].id) && words[i].id !== currentWord?.id) {
        console.log(`Found next unseen word at index ${i}: ${words[i].word}`);
        setCurrentWordIndex(i);
        foundUnseen = true;
        break;
      }
    }

    // If no unseen words found in remaining set, check from beginning
    if (!foundUnseen) {
      for (let i = 0; i < currentWordIndex; i++) {
        if (!shownWordIds.has(words[i].id)) {
          console.log(`Found unseen word at beginning, index ${i}: ${words[i].word}`);
          setCurrentWordIndex(i);
          foundUnseen = true;
          break;
        }
      }
    }

    // If all words in current set have been shown, request new words
    if (!foundUnseen) {
      console.log('All words shown, requesting new set');
      if (onRequestNewWords) {
        onRequestNewWords();
        // Reset tracking and start fresh
        setShownWordIds(new Set());
        setCurrentWordIndex(0);
      } else {
        // Fallback: restart current set
        console.log('No new words available, restarting current set');
        setShownWordIds(new Set());
        setCurrentWordIndex(0);
      }
    }
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
      {/* Achievement Message */}
      {achievementMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg animate-bounce">
          <div className="text-center font-bold text-lg">
            {achievementMessage}
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
              🎉
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
              <Badge variant="outline" className="text-sm px-3 py-1">
                {currentWordIndex + 1} / {words.length}
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

              {/* Kid-friendly Learning Stats - Compact Version */}
              <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-2 border border-blue-200">
                <div className="flex items-center justify-center gap-4">
                  {/* Remembered Words */}
                  <div className="bg-green-100 rounded-lg p-2 border border-green-300 text-center flex-1">
                    <div className="text-lg">🎉</div>
                    <div className="text-lg font-bold text-green-700">
                      {rememberedWordsCount}
                    </div>
                    <div className="text-xs text-green-600 font-medium">
                      I Know!
                    </div>
                  </div>

                  {/* Forgotten Words */}
                  <div className="bg-orange-100 rounded-lg p-2 border border-orange-300 text-center flex-1">
                    <div className="text-lg">💪</div>
                    <div className="text-lg font-bold text-orange-700">
                      {forgottenWordsCount}
                    </div>
                    <div className="text-xs text-orange-600 font-medium">
                      Practice
                    </div>
                  </div>
                </div>

                {/* Compact encouraging message */}
                <div className="mt-2 text-center">
                  {rememberedWordsCount > forgottenWordsCount ? (
                    <div className="text-green-600 font-medium text-xs">
                      🌟 Great job!
                    </div>
                  ) : forgottenWordsCount > rememberedWordsCount ? (
                    <div className="text-blue-600 font-medium text-xs">
                      🔥 Keep practicing!
                    </div>
                  ) : (
                    <div className="text-purple-600 font-medium text-xs">
                      🎯 You're doing great!
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
