import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Volume2,
  Heart,
  RotateCcw,
  Sparkles,
  Star,
  ThumbsUp,
  ThumbsDown,
  Brain,
  Sword,
  Shield,
  AlertTriangle,
  Flame,
  Target,
  Zap,
  Crown,
} from "lucide-react";
import { playSoundIfEnabled, playUIInteractionSoundIfEnabled } from "@/lib/soundEffects";
import { audioService } from "@/lib/audioService";
import { enhancedAudioService } from "@/lib/enhancedAudioService";
import { adventureService } from "@/lib/adventureService";
import { WordAdventureStatus } from "@shared/adventure";
import { AchievementTracker } from "@/lib/achievementTracker";
import { EnhancedAchievementPopup } from "@/components/EnhancedAchievementPopup";
import { useVoiceSettings } from "@/hooks/use-voice-settings";

interface Word {
  id: number;
  word: string;
  pronunciation?: string;
  definition: string;
  example?: string;
  funFact?: string;
  emoji?: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  imageUrl?: string;
  masteryLevel?: number;
  lastReviewed?: Date;
  nextReview?: Date;
}

interface WordCardProps {
  word: Word;
  showDefinition?: boolean;
  onPronounce?: (word: Word) => void;
  onFavorite?: (word: Word) => void;
  onWordMastered?: (wordId: number, rating: "easy" | "medium" | "hard") => void;
  showVocabularyBuilder?: boolean;
  className?: string;
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  showDefinition = false,
  onPronounce,
  onFavorite,
  onWordMastered,
  showVocabularyBuilder = false,
  className = "",
}) => {
  const [isFlipped, setIsFlipped] = useState(showDefinition);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [adventureStatus, setAdventureStatus] =
    useState<WordAdventureStatus | null>(null);
  const [wordAchievements, setWordAchievements] = useState<any[]>([]);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [isGesturing, setIsGesturing] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null);

  // Voice settings integration
  const voiceSettings = useVoiceSettings();

  // Initialize adventure status for this word
  React.useEffect(() => {
    let status = adventureService.getWordAdventureStatus(word.id.toString());
    if (!status) {
      status = adventureService.initializeWordAdventure(word.id.toString());
    }
    setAdventureStatus(status);
  }, [word.id]);

  const handlePronounce = async () => {
    if (isPlaying) return;

    setIsPlaying(true);
    setShowSparkles(true);

    // Use real speech synthesis for pronunciation
    enhancedAudioService.pronounceWord(word.word, {
      onStart: () => {
        console.log("Started pronunciation");
      },
      onEnd: () => {
        setIsPlaying(false);
        setShowSparkles(false);
        onPronounce?.(word);

        // Track pronunciation activity for journey achievements
        const pronunciationAchievements = AchievementTracker.trackActivity({
          type: "wordLearning",
          wordsLearned: 0, // Just listening, not learning
          category: word.category,
          timeSpent: 0.1, // Just a few seconds
        });

        if (pronunciationAchievements.length > 0) {
          setTimeout(() => {
            setWordAchievements(pronunciationAchievements);
          }, 1000);
        }
      },
      onError: () => {
        setIsPlaying(false);
        setShowSparkles(false);
        // Fallback to sound effect
        playSoundIfEnabled.pronunciation();
      },
    });

    // Safety timeout in case speech synthesis doesn't fire events
    setTimeout(() => {
      setIsPlaying(false);
      setShowSparkles(false);
    }, 3000);
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    if (!isFavorited) {
      enhancedAudioService.playSuccessSound(); // Use success sound instead of cheer for consistency
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 1000);

      // Enhanced haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } else {
      playUIInteractionSoundIfEnabled.click();
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
    onFavorite?.(word);
  };

  // Enhanced touch gesture handling with better mobile navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
    setIsGesturing(true);
    setSwipeDirection(null);

    // Light haptic feedback on touch start
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    setTouchPosition({ x: touch.clientX, y: touch.clientY });

    // Determine swipe direction early for visual feedback
    const threshold = 30;
    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > threshold) {
          setSwipeDirection('right');
        } else if (deltaX < -threshold) {
          setSwipeDirection('left');
        }
      } else {
        if (deltaY < -threshold) {
          setSwipeDirection('up');
        } else if (deltaY > threshold) {
          setSwipeDirection('down');
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const threshold = 60;

    setIsGesturing(false);
    setSwipeDirection(null);
    setTouchPosition(null);

    // Enhanced swipe gestures with improved back navigation
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        if (isFlipped) {
          // Swipe right on back - go back to front (enhanced back navigation)
          setIsFlipped(false);
          audioService.playWhooshSound();
          if (navigator.vibrate) {
            navigator.vibrate([50, 30, 50]);
          }
        } else {
          // Swipe right on front - flip to back
          setIsFlipped(true);
          audioService.playWhooshSound();
          if (navigator.vibrate) {
            navigator.vibrate([50, 30, 50]);
          }
        }
      } else {
        // Swipe left - favorite (works on both sides)
        handleFavorite();
      }
    } else if (deltaY < -threshold) {
      // Swipe up - pronounce (works on both sides)
      handlePronounce();
    } else if (deltaY > threshold && isFlipped) {
      // Swipe down on back side - enhanced back navigation
      setIsFlipped(false);
      audioService.playWhooshSound();
      if (navigator.vibrate) {
        navigator.vibrate([40, 20, 40]);
      }
    }

    setTouchStart(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-educational-green text-white";
      case "medium":
        return "bg-educational-orange text-white";
      case "hard":
        return "bg-educational-pink text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      // Core categories
      animals: "bg-gradient-to-br from-blue-400 to-blue-600",
      food: "bg-gradient-to-br from-red-400 to-orange-500",
      nature: "bg-gradient-to-br from-green-400 to-green-600",
      objects: "bg-gradient-to-br from-purple-400 to-purple-600",
      body: "bg-gradient-to-br from-pink-400 to-pink-600",

      // Extended categories
      clothes: "bg-gradient-to-br from-indigo-400 to-indigo-600",
      family: "bg-gradient-to-br from-yellow-400 to-amber-500",
      feelings: "bg-gradient-to-br from-rose-400 to-rose-600",
      colors: "bg-gradient-to-br from-violet-400 to-purple-500",
      numbers: "bg-gradient-to-br from-cyan-400 to-blue-500",

      // Additional categories
      greetings: "bg-gradient-to-br from-emerald-400 to-green-500",
      technology: "bg-gradient-to-br from-slate-400 to-gray-600",
      actions: "bg-gradient-to-br from-orange-400 to-red-500",
      weather: "bg-gradient-to-br from-sky-400 to-blue-500",
      transportation: "bg-gradient-to-br from-yellow-500 to-orange-500",

      // Educational categories
      school: "bg-gradient-to-br from-blue-500 to-indigo-600",
      emotions: "bg-gradient-to-br from-pink-500 to-rose-500",
      toys: "bg-gradient-to-br from-purple-500 to-pink-500",
      music: "bg-gradient-to-br from-violet-500 to-purple-600",
      sports: "bg-gradient-to-br from-green-500 to-emerald-600",

      // Legacy support
      general: "bg-gradient-to-br from-purple-400 to-purple-600",
      science: "bg-gradient-to-br from-pink-400 to-pink-600",
    };
    return (
      colors[category as keyof typeof colors] ||
      "bg-gradient-to-br from-blue-400 to-purple-600"
    );
  };

  return (
    <div
      className={`relative w-full max-w-[340px] sm:max-w-[380px] md:max-w-sm mx-auto ${className}`}
    >
      <Card
        className={`h-[380px] sm:h-[420px] md:h-[400px] cursor-pointer transition-all duration-300 transform-gpu active:scale-[0.98] hover:scale-[1.01] shadow-lg hover:shadow-xl ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        } ${
          adventureStatus && adventureStatus.health < 30
            ? "ring-2 ring-red-400/50 shadow-red-400/20 shadow-xl animate-pulse"
            : adventureStatus && adventureStatus.health < 50
              ? "ring-2 ring-orange-400/50 shadow-orange-400/20 shadow-lg"
              : ""
        } ${
          isGesturing
            ? swipeDirection === 'right'
              ? "scale-[1.02] ring-2 ring-green-400/50 shadow-green-400/20"
              : swipeDirection === 'left'
                ? "scale-[1.02] ring-2 ring-red-400/50 shadow-red-400/20"
                : swipeDirection === 'up'
                  ? "scale-[1.02] ring-2 ring-blue-400/50 shadow-blue-400/20"
                  : swipeDirection === 'down'
                    ? "scale-[1.02] ring-2 ring-purple-400/50 shadow-purple-400/20"
                    : "scale-[1.02] ring-2 ring-blue-400/50"
            : ""
        }`}
        style={{
          transformStyle: "preserve-3d",
          touchAction: "pan-y",
        }}
        onClick={() => {
          setIsFlipped(!isFlipped);
          audioService.playWhooshSound();
          if (navigator.vibrate) {
            navigator.vibrate([30, 20, 30]);
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="button"
        tabIndex={0}
        aria-label={`Word card for ${word.word}. ${isFlipped ? "Showing definition" : "Showing word"}. Tap to flip or swipe for actions.`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsFlipped(!isFlipped);
            audioService.playWhooshSound();
          }
        }}
      >
        {/* Front of card - Enhanced Mobile Optimized */}
        <CardContent
          className={`absolute inset-0 w-full h-full ${getCategoryColor(word.category)} rounded-xl p-2 sm:p-3 flex flex-col text-white`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Mobile-First Header with Badges */}
          <div className="flex flex-wrap items-start justify-between gap-0.5 mb-1.5">
            <div className="flex flex-wrap gap-0.5 max-w-[75%]">
              <Badge
                className={`${getDifficultyColor(word.difficulty)} text-[9px] font-medium px-1 py-0.5 leading-none`}
              >
                {word.difficulty === "easy"
                  ? "🌟 Easy"
                  : word.difficulty === "medium"
                    ? "⭐ Med"
                    : "🔥 Hard"}
              </Badge>
              <Badge
                variant="outline"
                className="bg-white/20 border-white/30 text-white text-[9px] px-1 py-0.5 leading-none truncate max-w-[70px]"
              >
                {word.category}
              </Badge>

              {/* Mobile-Optimized Adventure Health Status */}
              {adventureStatus && (
                <Badge
                  variant="outline"
                  className={`text-[8px] flex items-center gap-0.5 px-1 py-0.5 leading-none ${
                    adventureStatus.health >= 80
                      ? "bg-green-500/20 border-green-400/50 text-green-200"
                      : adventureStatus.health >= 50
                        ? "bg-yellow-500/20 border-yellow-400/50 text-yellow-200"
                        : adventureStatus.health >= 30
                          ? "bg-orange-500/20 border-orange-400/50 text-orange-200"
                          : "bg-red-500/20 border-red-400/50 text-red-200 animate-pulse"
                  }`}
                >
                  {adventureStatus.health >= 80 ? (
                    <Crown className="w-2 h-2" />
                  ) : adventureStatus.health >= 50 ? (
                    <Shield className="w-2 h-2" />
                  ) : adventureStatus.health >= 30 ? (
                    <Target className="w-2 h-2" />
                  ) : (
                    <Flame className="w-2 h-2" />
                  )}
                  <span className="font-medium text-[8px]">
                    {adventureStatus.health}%
                  </span>
                </Badge>
              )}
            </div>

            {/* Enhanced Mobile-Optimized Favorite Button */}
            <Button
              size="sm"
              variant="ghost"
              className={`text-white hover:bg-white/20 active:bg-white/30 p-1.5 h-auto min-w-[40px] min-h-[40px] transition-all duration-200 rounded-full flex-shrink-0 border border-white/20 bg-white/10 backdrop-blur-sm active:scale-95 ${
                isFavorited ? "scale-105 text-red-300 border-red-300/40 bg-red-500/20" : "hover:border-white/40"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleFavorite();
              }}
            >
              <Heart
                className={`w-4 h-4 transition-all duration-200 ${
                  isFavorited ? "fill-current animate-pulse" : ""
                }`}
              />
              {showSparkles && isFavorited && (
                <Star className="w-2.5 h-2.5 absolute -top-0.5 -right-0.5 text-yellow-300 animate-bounce" />
              )}
            </Button>
          </div>

          {/* Mobile-Optimized Image/Emoji Container - Larger Size */}
          {word.imageUrl ? (
            <div className="relative mx-auto mb-1.5">
              <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full bg-white/20 backdrop-blur-sm shadow-lg ring-1 ring-white/30 flex items-center justify-center overflow-hidden">
                <img
                  src={word.imageUrl}
                  alt={word.word}
                  className="w-full h-full object-cover rounded-full shadow-md"
                />
              </div>
            </div>
          ) : (
            <div className="relative mx-auto mb-1.5">
              <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-white/30 via-white/20 to-white/10 backdrop-blur-md shadow-lg ring-1 ring-white/30 flex items-center justify-center relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-1 left-1 w-2.5 h-2.5 bg-white/20 rounded-full animate-pulse"></div>
                <div className="absolute bottom-2 right-2 w-2 h-2 bg-white/15 rounded-full animate-bounce delay-300"></div>
                <div className="absolute top-1/2 right-1.5 w-1.5 h-1.5 bg-white/25 rounded-full animate-ping delay-700"></div>

                {/* Main emoji - Even Larger sizing */}
                <span className="text-5xl sm:text-6xl md:text-7xl relative z-10 drop-shadow-lg">
                  {word.emoji || "📚"}
                </span>

                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/5 to-white/10"></div>
              </div>
            </div>
          )}

          {/* Mobile-Optimized Word with Inline Speaker */}
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-1">
            {/* Word name with speaker button inline */}
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-wide drop-shadow-md leading-tight">
                {word.word}
              </h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePronounce();
                }}
                disabled={isPlaying}
                className={`text-white hover:bg-white/30 hover:scale-105 p-1.5 h-auto min-w-[32px] min-h-[32px] rounded-full transition-all duration-200 border border-white/40 bg-white/10 backdrop-blur-sm shadow-md ${
                  isPlaying
                    ? "scale-105 bg-yellow-400/30 border-yellow-300/60 shadow-yellow-300/30 animate-bounce"
                    : "hover:border-white/60"
                }`}
              >
                <Volume2
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-all duration-200 ${isPlaying ? "text-yellow-200 animate-pulse scale-105" : "text-white"}`}
                />
                {showSparkles && (
                  <Sparkles className="w-2 h-2 absolute -top-0.5 -right-0.5 text-yellow-300 animate-spin" />
                )}
                {isPlaying && (
                  <div className="absolute inset-0 rounded-full border border-yellow-300/50 animate-ping"></div>
                )}
              </Button>
            </div>

            {/* Pronunciation text only */}
            {word.pronunciation && (
              <div className="text-xs sm:text-sm opacity-90 font-medium leading-tight">
                {word.pronunciation}
              </div>
            )}
          </div>

          {/* Enhanced Mobile Footer with Gesture Hints */}
          <div className="text-center space-y-0.5">
            {adventureStatus && (
              <p className="text-[9px] opacity-60 leading-tight">
                Last seen:{" "}
                {new Date(adventureStatus.last_seen).toLocaleDateString()}
              </p>
            )}
            <p className="text-[9px] sm:text-[10px] opacity-75 leading-tight">
              <RotateCcw className="w-2 h-2 sm:w-2.5 sm:h-2.5 inline mr-0.5" />
              Tap to see definition
            </p>

            {/* Enhanced Mobile gesture hints with better visual feedback */}
            <div className="hidden sm:block">
              <div className="flex justify-center gap-2 text-[9px] opacity-70">
                <span className="flex items-center gap-0.5">
                  <span className="w-4 h-2 bg-white/20 rounded-sm flex items-center justify-center text-[8px]">←</span>
                  <span>❤️</span>
                </span>
                <span className="flex items-center gap-0.5">
                  <span className="w-4 h-2 bg-white/20 rounded-sm flex items-center justify-center text-[8px]">↑</span>
                  <span>🔊</span>
                </span>
                <span className="flex items-center gap-0.5">
                  <span className="w-4 h-2 bg-white/20 rounded-sm flex items-center justify-center text-[8px]">→</span>
                  <span>🔄</span>
                </span>
              </div>
            </div>

            {/* Mobile-only compact hints */}
            <div className="sm:hidden">
              <div className="flex justify-center gap-1.5 text-[8px] opacity-60">
                <span>← ❤️</span>
                <span>↑ 🔊</span>
                <span>→ 🔄</span>
              </div>
            </div>

            <div className="flex justify-center gap-0.5">
              <div className="w-1 h-1 bg-white/50 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-white/50 rounded-full animate-bounce delay-100"></div>
              <div className="w-1 h-1 bg-white/50 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </CardContent>

        {/* Back of card - Mobile Optimized */}
        <CardContent
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-2 sm:p-3 flex flex-col text-white overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Enhanced Mobile Back Navigation */}
          <div className="absolute top-1.5 right-1.5 z-10">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 active:bg-white/30 p-1.5 h-auto min-w-[40px] min-h-[40px] rounded-full border border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-200 active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
                audioService.playWhooshSound();
                if (navigator.vibrate) {
                  navigator.vibrate([40, 20, 40]);
                }
              }}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Enhanced Back Navigation Hint */}
          <div className="absolute top-1.5 left-1.5 z-10">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-2 py-1">
              <span className="text-[9px] text-white/80 font-medium">← Swipe or tap ↻</span>
            </div>
          </div>

          <h3 className="text-sm sm:text-base font-semibold mb-1.5 text-center pr-8 leading-tight">
            {word.word} {word.emoji}
          </h3>

          <div className="space-y-1.5 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            <div>
              <h4 className="text-[9px] font-medium mb-0.5 text-yellow-300">
                Definition:
              </h4>
              <p className="text-[11px] sm:text-xs leading-tight">
                {word.definition}
              </p>
            </div>

            {word.example && (
              <div>
                <h4 className="text-[9px] font-medium mb-0.5 text-green-300">
                  Example:
                </h4>
                <p className="text-[11px] italic opacity-90 leading-tight">
                  "{word.example}"
                </p>
              </div>
            )}

            {word.funFact && (
              <div>
                <h4 className="text-[9px] font-medium mb-0.5 text-pink-300">
                  Fun Fact:
                </h4>
                <p className="text-[10px] sm:text-[11px] opacity-90 leading-tight">
                  {word.funFact}
                </p>
              </div>
            )}
          </div>

          {/* Mobile-Optimized Vocabulary Builder Features */}
          {showVocabularyBuilder && (
            <div className="border-t border-white/20 pt-1.5 mt-1.5">
              {/* Adventure Word Health - Mobile Optimized */}
              <div className="mb-1.5">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="text-[10px] font-medium text-blue-300 flex items-center gap-0.5">
                    <Heart className="w-2 h-2" />
                    Word Health
                  </h4>
                  <div className="flex items-center gap-0.5">
                    <span
                      className={`text-[10px] font-bold ${
                        (adventureStatus?.health || 100) >= 80
                          ? "text-green-300"
                          : (adventureStatus?.health || 100) >= 50
                            ? "text-yellow-300"
                            : (adventureStatus?.health || 100) >= 30
                              ? "text-orange-300"
                              : "text-red-300"
                      }`}
                    >
                      {adventureStatus?.health || 100}%
                    </span>
                    {(adventureStatus?.health || 100) < 50 && (
                      <AlertTriangle className="w-2 h-2 text-orange-300 animate-pulse" />
                    )}
                  </div>
                </div>
                <Progress
                  value={adventureStatus?.health || 100}
                  className={`h-2 ${
                    (adventureStatus?.health || 100) >= 50
                      ? "bg-green-100/20"
                      : (adventureStatus?.health || 100) >= 30
                        ? "bg-orange-100/20"
                        : "bg-red-100/20"
                  }`}
                />

                {/* Mobile-Optimized Adventure Status */}
                <div className="mt-0.5 flex items-center justify-between text-[9px]">
                  <div className="flex items-center gap-0.5">
                    {(adventureStatus?.health || 100) < 30 ? (
                      <>
                        <Flame className="w-2 h-2 text-red-400 animate-pulse" />
                        <span className="text-red-300 font-medium">
                          Needs Rescue!
                        </span>
                      </>
                    ) : (adventureStatus?.health || 100) < 50 ? (
                      <>
                        <Target className="w-2 h-2 text-orange-400" />
                        <span className="text-orange-300">Needs Practice</span>
                      </>
                    ) : (adventureStatus?.health || 100) < 80 ? (
                      <>
                        <Shield className="w-2 h-2 text-yellow-400" />
                        <span className="text-yellow-300">Good</span>
                      </>
                    ) : (
                      <>
                        <Crown className="w-2 h-2 text-green-400" />
                        <span className="text-green-300">Mastered</span>
                      </>
                    )}
                  </div>
                  <span className="text-white/60">
                    Forgot {adventureStatus?.forget_count || 0}x
                  </span>
                </div>
              </div>

              {/* Mobile-Optimized Adventure Rating Buttons */}
              <div className="space-y-0.5">
                <h4 className="text-[10px] font-medium text-purple-300 mb-0.5 flex items-center gap-0.5">
                  <Sword className="w-2 h-2" />
                  Rate Your Knowledge
                </h4>
                <div className="flex gap-0.5 justify-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 active:bg-red-500/40 text-red-200 border border-red-500/30 transition-all active:scale-95 min-h-[32px] text-[9px] px-1.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Track in adventure system
                      const updatedStatus =
                        adventureService.trackWordInteraction(
                          word.id.toString(),
                          false, // incorrect/hard
                          false,
                        );
                      setAdventureStatus(updatedStatus);

                      // Track word mastery for journey achievements (hard/needs practice)
                      const masteryAchievements =
                        AchievementTracker.trackActivity({
                          type: "wordLearning",
                          wordsLearned: 0, // Not considered learned if marked as hard
                          accuracy: 0,
                          category: word.category,
                          timeSpent: 1,
                        });

                      if (masteryAchievements.length > 0) {
                        setTimeout(() => {
                          setWordAchievements(masteryAchievements);
                        }, 1000);
                      }

                      // Also call the original handler
                      onWordMastered?.(word.id, "hard");
                    }}
                  >
                    <ThumbsDown className="w-2 h-2 mr-0.5" />
                    Forgot
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 active:bg-yellow-500/40 text-yellow-200 border border-yellow-500/30 transition-all active:scale-95 min-h-[32px] text-[9px] px-1.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Track in adventure system with hesitation
                      const updatedStatus =
                        adventureService.trackWordInteraction(
                          word.id.toString(),
                          true, // correct but with hesitation
                          true,
                        );
                      setAdventureStatus(updatedStatus);

                      // Track word mastery for journey achievements (medium/kinda)
                      const masteryAchievements =
                        AchievementTracker.trackActivity({
                          type: "wordLearning",
                          wordsLearned: 0.5, // Partial learning
                          accuracy: 50,
                          category: word.category,
                          timeSpent: 1,
                        });

                      if (masteryAchievements.length > 0) {
                        setTimeout(() => {
                          setWordAchievements(masteryAchievements);
                        }, 1000);
                      }

                      // Also call the original handler
                      onWordMastered?.(word.id, "medium");
                    }}
                  >
                    <Star className="w-2 h-2 mr-0.5" />
                    Kinda
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 bg-green-500/20 hover:bg-green-500/30 active:bg-green-500/40 text-green-200 border border-green-500/30 transition-all active:scale-95 min-h-[32px] text-[9px] px-1.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Track in adventure system as correct
                      const updatedStatus =
                        adventureService.trackWordInteraction(
                          word.id.toString(),
                          true, // correct
                          false,
                        );
                      setAdventureStatus(updatedStatus);

                      // Track word mastery for journey achievements (easy/learned!)
                      const masteryAchievements =
                        AchievementTracker.trackActivity({
                          type: "wordLearning",
                          wordsLearned: 1, // Fully learned
                          accuracy: 100,
                          category: word.category,
                          timeSpent: 1,
                        });

                      if (masteryAchievements.length > 0) {
                        setTimeout(() => {
                          setWordAchievements(masteryAchievements);
                        }, 1000);
                      }

                      // Also call the original handler
                      onWordMastered?.(word.id, "easy");
                    }}
                  >
                    <ThumbsUp className="w-2 h-2 mr-0.5" />
                    Easy!
                  </Button>
                </div>

                {/* Mobile-Optimized Adventure Quick Actions */}
                {(adventureStatus?.health || 100) < 50 && (
                  <div className="mt-1.5 p-1.5 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-0.5">
                      <div className="flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5 text-orange-400" />
                        <span className="text-[9px] text-orange-300 font-medium text-center sm:text-left">
                          This word needs practice!
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-orange-500/20 hover:bg-orange-500/30 active:bg-orange-500/40 text-orange-200 border border-orange-500/30 px-1.5 py-1 h-auto text-[9px] min-h-[28px] transition-all active:scale-95"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Trigger adventure rescue - this could open adventure dashboard
                          console.log(
                            "Opening rescue mission for word:",
                            word.word,
                          );
                        }}
                      >
                        <Sword className="w-2 h-2 mr-0.5" />
                        Rescue
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Achievement Popup for Word Mastery */}
      {wordAchievements.length > 0 && (
        <EnhancedAchievementPopup
          achievements={wordAchievements}
          onClose={() => setWordAchievements([])}
          onAchievementClaim={(achievement) => {
            console.log("Word mastery achievement claimed:", achievement);
            // Could add additional reward logic here
          }}
          autoCloseDelay={5000} // Auto-close after 5 seconds for word achievements
        />
      )}

      {/* Screen reader live region for accessibility */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {isFlipped
          ? `Showing definition for ${word.word}`
          : `Showing word ${word.word}`}
        {isPlaying && ` Pronouncing ${word.word}`}
        {isFavorited && ` ${word.word} added to favorites`}
        {isGesturing && " Gesture detected"}
      </div>
    </div>
  );
};
