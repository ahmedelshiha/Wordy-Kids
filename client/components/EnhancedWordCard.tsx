import React, { useState, useRef, useEffect } from "react";
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
  Eye,
  Share,
  Bookmark,
} from "lucide-react";
import { playSoundIfEnabled } from "@/lib/soundEffects";
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

interface EnhancedWordCardProps {
  word: Word;
  showDefinition?: boolean;
  onPronounce?: (word: Word) => void;
  onFavorite?: (word: Word) => void;
  onWordMastered?: (wordId: number, rating: "easy" | "medium" | "hard") => void;
  showVocabularyBuilder?: boolean;
  className?: string;
  enableSwipeGestures?: boolean;
  showAccessibilityFeatures?: boolean;
}

export const EnhancedWordCard: React.FC<EnhancedWordCardProps> = ({
  word,
  showDefinition = false,
  onPronounce,
  onFavorite,
  onWordMastered,
  showVocabularyBuilder = false,
  className = "",
  enableSwipeGestures = true,
  showAccessibilityFeatures = true,
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
  const [isZoomed, setIsZoomed] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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

  // Enhanced touch gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableSwipeGestures) return;
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });

    // Add touch feedback animation
    if (cardRef.current) {
      cardRef.current.classList.add("animate-touch-feedback");
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!enableSwipeGestures || !touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // Remove touch feedback animation
    if (cardRef.current) {
      cardRef.current.classList.remove("animate-touch-feedback");
    }

    // Swipe gestures
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          // Swipe right - flip card
          setIsFlipped(!isFlipped);
          audioService.playWhooshSound();
        } else {
          // Swipe left - favorite
          handleFavorite();
        }
      }
    } else if (Math.abs(deltaY) > 50) {
      if (deltaY < 0) {
        // Swipe up - pronounce
        handlePronounce();
      }
    }

    setTouchStart(null);
  };

  const handlePronounce = async () => {
    if (isPlaying) return;

    setIsPlaying(true);
    setShowSparkles(true);

    // Enhanced haptic feedback for mobile
    if ("vibrate" in navigator) {
      navigator.vibrate([50, 100, 50]);
    }

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
          wordsLearned: 0,
          category: word.category,
          timeSpent: 0.1,
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
        playSoundIfEnabled.pronunciation();
      },
    });

    // Safety timeout
    setTimeout(() => {
      setIsPlaying(false);
      setShowSparkles(false);
    }, 3000);
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    if (!isFavorited) {
      enhancedAudioService.playSuccessSound();
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 1000);

      // Enhanced haptic feedback
      if ("vibrate" in navigator) {
        navigator.vibrate([100]);
      }
    } else {
      playSoundIfEnabled.click();
    }
    onFavorite?.(word);
  };

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
    audioService.playWhooshSound();

    // Add flip animation class
    if (cardRef.current) {
      cardRef.current.classList.add("animate-card-flip");
      setTimeout(() => {
        cardRef.current?.classList.remove("animate-card-flip");
      }, 600);
    }
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
      animals: "bg-educational-blue",
      food: "bg-educational-orange",
      nature: "bg-educational-green",
      general: "bg-educational-purple",
      science: "bg-educational-pink",
      sports: "bg-educational-yellow",
      body: "bg-educational-pink",
      colors: "bg-educational-purple",
      numbers: "bg-educational-blue",
      family: "bg-educational-yellow",
      feelings: "bg-educational-purple",
      clothes: "bg-educational-blue",
    };
    return colors[category as keyof typeof colors] || "bg-educational-blue";
  };

  return (
    <div
      ref={cardRef}
      className={`relative w-full max-w-xs sm:max-w-sm mx-auto mobile-optimized ${className} ${isZoomed ? "scale-110 z-50" : ""}`}
    >
      {/* Accessibility Controls */}
      {showAccessibilityFeatures && (
        <div className="absolute -top-2 -right-2 z-10 flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="w-8 h-8 p-0 bg-white/90 hover:bg-white rounded-full shadow-lg"
            onClick={() => setIsZoomed(!isZoomed)}
            aria-label="Toggle zoom"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-8 h-8 p-0 bg-white/90 hover:bg-white rounded-full shadow-lg"
            onClick={() => setHighContrastMode(!highContrastMode)}
            aria-label="Toggle high contrast"
          >
            <Target className="w-4 h-4" />
          </Button>
        </div>
      )}

      <Card
        className={`h-[420px] sm:h-[400px] md:h-[380px] cursor-pointer transition-all duration-500 transform-gpu hardware-accelerated touch-optimized word-card-mobile ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        } ${
          adventureStatus && adventureStatus.health < 30
            ? "ring-2 ring-red-400/50 shadow-red-400/20 shadow-xl animate-mobile-pulse"
            : adventureStatus && adventureStatus.health < 50
              ? "ring-2 ring-orange-400/50 shadow-orange-400/20 shadow-lg"
              : ""
        } ${highContrastMode ? "ring-4 ring-black shadow-2xl" : ""}`}
        style={{
          transformStyle: "preserve-3d",
          filter: highContrastMode ? "contrast(1.5) brightness(1.2)" : "none",
        }}
        onClick={handleCardFlip}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="button"
        tabIndex={0}
        aria-label={`Word card for ${word.word}. Tap to flip or swipe for actions.`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardFlip();
          }
        }}
      >
        {/* Front of card - Enhanced Mobile Optimized */}
        <CardContent
          className={`absolute inset-0 w-full h-full ${getCategoryColor(word.category)} rounded-xl p-3 sm:p-4 flex flex-col text-white touch-optimized`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Enhanced Mobile Header with Better Touch Targets */}
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <div className="flex flex-wrap gap-1.5">
              <Badge
                className={`${getDifficultyColor(word.difficulty)} text-xs font-medium px-2 py-1 transition-transform duration-200 hover:scale-105`}
              >
                {word.difficulty === "easy"
                  ? "🌟 Easy"
                  : word.difficulty === "medium"
                    ? "⭐ Medium"
                    : "🔥 Hard"}
              </Badge>
              <Badge
                variant="outline"
                className="bg-white/20 border-white/30 text-white text-xs px-2 py-1"
              >
                {word.category}
              </Badge>

              {/* Enhanced Adventure Health Status */}
              {adventureStatus && (
                <Badge
                  variant="outline"
                  className={`text-xs flex items-center gap-1 px-2 py-1 transition-all duration-300 ${
                    adventureStatus.health >= 80
                      ? "bg-green-500/20 border-green-400/50 text-green-200"
                      : adventureStatus.health >= 50
                        ? "bg-yellow-500/20 border-yellow-400/50 text-yellow-200"
                        : adventureStatus.health >= 30
                          ? "bg-orange-500/20 border-orange-400/50 text-orange-200"
                          : "bg-red-500/20 border-red-400/50 text-red-200 animate-mobile-pulse"
                  }`}
                >
                  {adventureStatus.health >= 80 ? (
                    <Crown className="w-3 h-3" />
                  ) : adventureStatus.health >= 50 ? (
                    <Shield className="w-3 h-3" />
                  ) : adventureStatus.health >= 30 ? (
                    <Target className="w-3 h-3" />
                  ) : (
                    <Flame className="w-3 h-3" />
                  )}
                  <span className="font-medium">{adventureStatus.health}%</span>
                </Badge>
              )}
            </div>

            {/* Enhanced Mobile Action Buttons */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 p-2 h-auto min-w-[44px] min-h-[44px] transition-all duration-300 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  // Share functionality
                  if (navigator.share) {
                    navigator.share({
                      title: `Learn the word: ${word.word}`,
                      text: `${word.definition}`,
                      url: window.location.href,
                    });
                  }
                }}
                aria-label="Share word"
              >
                <Share className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className={`text-white hover:bg-white/20 p-2 h-auto min-w-[44px] min-h-[44px] transition-all duration-300 rounded-full ${
                  isFavorited ? "scale-110 text-red-300" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavorite();
                }}
                aria-label={
                  isFavorited ? "Remove from favorites" : "Add to favorites"
                }
              >
                <Heart
                  className={`w-4 h-4 transition-all duration-300 ${
                    isFavorited ? "fill-current animate-pulse" : ""
                  }`}
                />
                {showSparkles && isFavorited && (
                  <Star className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-mobile-sparkle" />
                )}
              </Button>
            </div>
          </div>

          {/* Enhanced Image/Emoji Container with Better Touch Response */}
          {word.imageUrl ? (
            <div className="relative mx-auto mb-3">
              <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full bg-white/20 backdrop-blur-sm shadow-2xl ring-4 ring-white/30 flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-105">
                <img
                  src={word.imageUrl}
                  alt={word.word}
                  className="w-full h-full object-cover rounded-full shadow-lg"
                  loading="lazy"
                />
              </div>
            </div>
          ) : (
            <div className="relative mx-auto mb-3">
              <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-white/30 via-white/20 to-white/10 backdrop-blur-md shadow-2xl ring-4 ring-white/30 flex items-center justify-center relative overflow-hidden transition-transform duration-300 hover:scale-105">
                {/* Enhanced decorative background elements */}
                <div className="absolute top-1 left-1 w-3 h-3 bg-white/20 rounded-full animate-pulse"></div>
                <div className="absolute bottom-2 right-2 w-2 h-2 bg-white/15 rounded-full animate-bounce delay-300"></div>
                <div className="absolute top-1/2 right-1 w-1.5 h-1.5 bg-white/25 rounded-full animate-ping delay-700"></div>

                {/* Main emoji with better mobile sizing */}
                <span className="text-5xl sm:text-6xl md:text-7xl relative z-10 drop-shadow-lg transition-transform duration-300 hover:scale-110">
                  {word.emoji || "📚"}
                </span>

                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/5 to-white/10"></div>
              </div>
            </div>
          )}

          {/* Enhanced Word and Pronunciation with Better Accessibility */}
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wide drop-shadow-md">
              {word.word}
            </h2>

            {word.pronunciation && (
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                <span className="text-sm sm:text-base opacity-90 font-medium">
                  {word.pronunciation}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePronounce();
                  }}
                  disabled={isPlaying}
                  className={`text-white hover:bg-white/30 hover:scale-110 p-3 h-auto min-w-[48px] min-h-[48px] rounded-full transition-all duration-300 border-2 border-white/40 bg-white/10 backdrop-blur-sm shadow-lg ${
                    isPlaying
                      ? "scale-125 bg-yellow-400/30 border-yellow-300/60 shadow-yellow-300/30 animate-bounce"
                      : "hover:border-white/60"
                  }`}
                  aria-label={`Pronounce ${word.word}`}
                >
                  <Volume2
                    className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${isPlaying ? "text-yellow-200 animate-pulse scale-110" : "text-white"}`}
                  />
                  {showSparkles && (
                    <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300 animate-spin" />
                  )}
                  {isPlaying && (
                    <div className="absolute inset-0 rounded-full border-2 border-yellow-300/50 animate-ping"></div>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Enhanced Mobile Footer with Swipe Instructions */}
          <div className="text-center">
            {adventureStatus && (
              <p className="text-xs opacity-60 mb-2">
                Last seen:{" "}
                {new Date(adventureStatus.last_seen).toLocaleDateString()}
              </p>
            )}

            {/* Mobile swipe instructions */}
            <div className="mb-2">
              <p className="text-xs sm:text-sm opacity-75 mb-1 flex items-center justify-center gap-1">
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                Tap to flip • Swipe for actions
              </p>
              {enableSwipeGestures && (
                <div className="flex justify-center gap-4 text-xs opacity-60">
                  <span className="flex items-center gap-1">
                    ← <Heart className="w-3 h-3" />
                  </span>
                  <span className="flex items-center gap-1">
                    ↑ <Volume2 className="w-3 h-3" />
                  </span>
                  <span className="flex items-center gap-1">
                    → <RotateCcw className="w-3 h-3" />
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-1.5">
              <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </CardContent>

        {/* Back of card - Enhanced Mobile Optimized */}
        <CardContent
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-4 sm:p-5 flex flex-col text-white touch-optimized"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Enhanced Back Controls */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 p-2 h-auto min-w-[44px] min-h-[44px] rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                // Bookmark functionality
                if ("vibrate" in navigator) {
                  navigator.vibrate([50]);
                }
              }}
              aria-label="Bookmark word"
            >
              <Bookmark className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 p-2 h-auto min-w-[44px] min-h-[44px] rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              aria-label="Return to front"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <h3 className="text-lg sm:text-xl font-semibold mb-3 text-center pr-20">
            {word.word} {word.emoji}
          </h3>

          <div className="space-y-3 flex-1 overflow-y-auto">
            <div>
              <h4 className="text-xs font-medium mb-1 text-yellow-300">
                Definition:
              </h4>
              <p className="text-sm sm:text-base leading-relaxed">
                {word.definition}
              </p>
            </div>

            {word.example && (
              <div>
                <h4 className="text-xs font-medium mb-1 text-green-300">
                  Example:
                </h4>
                <p className="text-sm italic opacity-90 leading-relaxed">
                  "{word.example}"
                </p>
              </div>
            )}

            {word.funFact && (
              <div>
                <h4 className="text-xs font-medium mb-1 text-pink-300">
                  Fun Fact:
                </h4>
                <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                  {word.funFact}
                </p>
              </div>
            )}
          </div>

          {/* Enhanced Vocabulary Builder Features */}
          {showVocabularyBuilder && (
            <div className="border-t border-white/20 pt-3 mt-3">
              {/* Adventure Word Health */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-blue-300 flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    Word Health
                  </h4>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold ${
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
                      <AlertTriangle className="w-3 h-3 text-orange-300 animate-pulse" />
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

                <div className="mt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    {(adventureStatus?.health || 100) < 30 ? (
                      <>
                        <Flame className="w-3 h-3 text-red-400 animate-pulse" />
                        <span className="text-red-300 font-medium">
                          Needs Rescue!
                        </span>
                      </>
                    ) : (adventureStatus?.health || 100) < 50 ? (
                      <>
                        <Target className="w-3 h-3 text-orange-400" />
                        <span className="text-orange-300">Needs Practice</span>
                      </>
                    ) : (adventureStatus?.health || 100) < 80 ? (
                      <>
                        <Shield className="w-3 h-3 text-yellow-400" />
                        <span className="text-yellow-300">Good</span>
                      </>
                    ) : (
                      <>
                        <Crown className="w-3 h-3 text-green-400" />
                        <span className="text-green-300">Mastered</span>
                      </>
                    )}
                  </div>
                  <span className="text-white/60">
                    Forgot {adventureStatus?.forget_count || 0}x
                  </span>
                </div>
              </div>

              {/* Enhanced Rating Buttons with Better Touch Targets */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-purple-300 mb-2 flex items-center gap-1">
                  <Sword className="w-3 h-3" />
                  Rate Your Knowledge
                </h4>
                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 active:bg-red-500/40 text-red-200 border border-red-500/30 transition-all active:scale-95 min-h-[48px] text-xs touch-optimized"
                    onClick={(e) => {
                      e.stopPropagation();
                      if ("vibrate" in navigator) {
                        navigator.vibrate([100]);
                      }
                      const updatedStatus =
                        adventureService.trackWordInteraction(
                          word.id.toString(),
                          false,
                          false,
                        );
                      setAdventureStatus(updatedStatus);
                      onWordMastered?.(word.id, "hard");
                    }}
                  >
                    <ThumbsDown className="w-3 h-3 mr-1" />
                    Forgot
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 active:bg-yellow-500/40 text-yellow-200 border border-yellow-500/30 transition-all active:scale-95 min-h-[48px] text-xs touch-optimized"
                    onClick={(e) => {
                      e.stopPropagation();
                      if ("vibrate" in navigator) {
                        navigator.vibrate([50]);
                      }
                      const updatedStatus =
                        adventureService.trackWordInteraction(
                          word.id.toString(),
                          true,
                          true,
                        );
                      setAdventureStatus(updatedStatus);
                      onWordMastered?.(word.id, "medium");
                    }}
                  >
                    <Star className="w-3 h-3 mr-1" />
                    Kinda
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 bg-green-500/20 hover:bg-green-500/30 active:bg-green-500/40 text-green-200 border border-green-500/30 transition-all active:scale-95 min-h-[48px] text-xs touch-optimized"
                    onClick={(e) => {
                      e.stopPropagation();
                      if ("vibrate" in navigator) {
                        navigator.vibrate([50, 50]);
                      }
                      const updatedStatus =
                        adventureService.trackWordInteraction(
                          word.id.toString(),
                          true,
                          false,
                        );
                      setAdventureStatus(updatedStatus);
                      onWordMastered?.(word.id, "easy");
                    }}
                  >
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    Easy!
                  </Button>
                </div>

                {/* Enhanced Rescue Action */}
                {(adventureStatus?.health || 100) < 50 && (
                  <div className="mt-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-orange-300 font-medium text-center sm:text-left">
                          This word needs practice!
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-orange-500/20 hover:bg-orange-500/30 active:bg-orange-500/40 text-orange-200 border border-orange-500/30 px-3 py-2 h-auto text-xs min-h-[44px] transition-all active:scale-95 touch-optimized"
                        onClick={(e) => {
                          e.stopPropagation();
                          if ("vibrate" in navigator) {
                            navigator.vibrate([200]);
                          }
                          console.log(
                            "Opening rescue mission for word:",
                            word.word,
                          );
                        }}
                      >
                        <Sword className="w-3 h-3 mr-1" />
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

      {/* Enhanced Achievement Popup */}
      {wordAchievements.length > 0 && (
        <EnhancedAchievementPopup
          achievements={wordAchievements}
          onClose={() => setWordAchievements([])}
          onAchievementClaim={(achievement) => {
            console.log("Word mastery achievement claimed:", achievement);
          }}
          autoCloseDelay={3000}
        />
      )}
    </div>
  );
};
