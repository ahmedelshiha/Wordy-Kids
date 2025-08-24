import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Volume2,
  RotateCcw,
  Sparkles,
  Star,
  ThumbsUp,
  ThumbsDown,
  Target,
} from "lucide-react";
import {
  playSoundIfEnabled,
  playUIInteractionSoundIfEnabled,
} from "@/lib/soundEffects";
import { audioService } from "@/lib/audioService";
import { enhancedAudioService } from "@/lib/enhancedAudioService";
import { useVoiceSettings } from "@/hooks/use-voice-settings";
import { cn } from "@/lib/utils";

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
  onWordMastered?: (wordId: number, rating: "easy" | "medium" | "hard") => void;
  showVocabularyBuilder?: boolean;
  className?: string;
}

const EnhancedWordCardComponent: React.FC<EnhancedWordCardProps> = ({
  word,
  showDefinition = false,
  onPronounce,
  onWordMastered,
  showVocabularyBuilder = false,
  className = "",
}) => {
  // Core states
  const [isFlipped, setIsFlipped] = useState(showDefinition);

  // Audio and interaction states
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ratedAs, setRatedAs] = useState<"easy" | "medium" | "hard" | null>(
    null,
  );
  const [showCelebration, setShowCelebration] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const voiceSettings = useVoiceSettings();

  // Enhanced pronunciation with normal voice
  const handlePronounce = async () => {
    if (isPlaying) return;

    setIsPlaying(true);
    setShowSparkles(true);

    try {
      // Normal voice
      enhancedAudioService.pronounceWord(word.word, {
        onStart: () => console.log("Started pronunciation"),
        onEnd: () => {
          setIsPlaying(false);
          setShowSparkles(false);
          onPronounce?.(word);
        },
        onError: () => handlePronunciationError(),
      });
    } catch (error) {
      handlePronunciationError();
    }

    // Safety timeout
    setTimeout(() => {
      setIsPlaying(false);
      setShowSparkles(false);
    }, 3000);
  };

  const handlePronunciationError = () => {
    setIsPlaying(false);
    setShowSparkles(false);
    playSoundIfEnabled.pronunciation();
  };

  // Enhanced smooth 3D flip with better feedback
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    audioService.playWhooshSound();
    playUIInteractionSoundIfEnabled.whoosh();

    // Enhanced haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([40, 10, 40]);
    }

    // Visual feedback
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
  };

  // Enhanced rating handler with celebration
  const handleRating = (rating: "easy" | "medium" | "hard") => {
    setRatedAs(rating);
    setShowCelebration(true);

    // Different sounds for different ratings
    if (rating === "easy") {
      playSoundIfEnabled.success();
      playSoundIfEnabled.levelUp();
    } else if (rating === "medium") {
      playSoundIfEnabled.click();
    } else {
      playSoundIfEnabled.hover();
    }

    // UI interaction sound
    playUIInteractionSoundIfEnabled.click();

    // Call the original handler
    onWordMastered?.(word.id, rating);

    // Reset celebration after animation
    setTimeout(() => {
      setShowCelebration(false);
    }, 2000);
  };

  // Handle touch start for visual feedback
  const handleTouchStart = () => {
    setIsPressed(true);
  };

  // Handle touch end
  const handleTouchEnd = () => {
    setTimeout(() => setIsPressed(false), 100);
  };

  // Get category colors
  const getCategoryColor = (category: string) => {
    const colors = {
      animals: "from-blue-400 to-blue-600",
      food: "from-red-400 to-orange-500",
      nature: "from-green-400 to-green-600",
      objects: "from-purple-400 to-purple-600",
      body: "from-pink-400 to-pink-600",
      clothes: "from-indigo-400 to-indigo-600",
      family: "from-yellow-400 to-amber-500",
      feelings: "from-rose-400 to-rose-600",
      colors: "from-violet-400 to-purple-500",
      numbers: "from-cyan-400 to-blue-500",
    };
    return (
      colors[category as keyof typeof colors] || "from-blue-400 to-purple-600"
    );
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

  return (
    <div
      className={cn(
        "relative w-full mx-auto",
        "max-w-[380px] sm:max-w-[340px] md:max-w-[380px]",
        "px-2 sm:px-0",
        className,
      )}
    >
      {/* 3D Card Container with smooth flip */}
      <div
        ref={cardRef}
        className={cn(
          "relative w-full transition-all duration-700 transform-gpu",
          "h-[380px] xs:h-[400px] sm:h-[380px] md:h-[420px] lg:h-[440px]",
          "touch-target-large mobile-optimized",
          "active:scale-98 hover:scale-[1.02] transition-transform",
          isFlipped && "rotate-y-180",
          isPressed && "scale-98",
        )}
        style={{
          willChange: "transform",
        }}
        onClick={handleFlip}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="button"
        tabIndex={0}
        aria-label={`Word card for ${word.word}. ${isFlipped ? "Showing definition" : "Showing word"}. Tap to flip.`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleFlip();
          }
        }}
      >
        {/* FRONT CARD - Kid-Friendly Design */}
        <Card
          className={cn(
            "absolute inset-0 w-full h-full backface-hidden",
            `bg-gradient-to-br ${getCategoryColor(word.category)}`,
            "shadow-xl hover:shadow-2xl rounded-xl overflow-hidden",
            "cursor-pointer transition-all duration-300",
            !isFlipped && "z-10",
          )}
        >
          <CardContent className="p-3 sm:p-4 h-full flex flex-col text-white relative touch-optimized">
            {/* Header with badges - Mobile optimized */}
            <div className="flex items-start mb-2 sm:mb-3">
              <div className="flex flex-wrap gap-1.5">
                <Badge
                  className={cn(
                    getDifficultyColor(word.difficulty),
                    "text-xs sm:text-sm font-semibold px-2 py-1 sm:px-3 sm:py-1.5",
                    "touch-target mobile-safe-text",
                  )}
                  variant="secondary"
                >
                  {word.difficulty === "easy"
                    ? "🌟 Easy"
                    : word.difficulty === "medium"
                      ? "⭐ Medium"
                      : "🔥 Hard"}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-white/20 border-white/30 text-white text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5"
                >
                  {word.category}
                </Badge>
              </div>
            </div>

            {/* Large emoji with animation */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative mb-3 sm:mb-4">
                <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full bg-white/20 backdrop-blur-md shadow-lg ring-1 ring-white/30 flex items-center justify-center relative overflow-hidden animate-gentle-float mobile-optimized">
                  {/* Decorative particles */}
                  <div className="absolute top-2 left-2 w-3 h-3 bg-white/20 rounded-full animate-sparkle"></div>
                  <div className="absolute bottom-3 right-3 w-2 h-2 bg-white/15 rounded-full animate-bounce delay-300"></div>
                  <div className="absolute top-1/2 right-2 w-2 h-2 bg-white/25 rounded-full animate-ping delay-700"></div>

                  {/* Main emoji - responsive and animated */}
                  <span className="text-6xl sm:text-7xl md:text-8xl relative z-10 drop-shadow-lg animate-gentle-bounce">
                    {word.emoji || "📚"}
                  </span>

                  {/* Sparkles effect */}
                  {showSparkles && (
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(8)].map((_, i) => (
                        <Sparkles
                          key={i}
                          className={cn(
                            "absolute w-4 h-4 text-yellow-300 animate-sparkle",
                            i % 2 === 0
                              ? "animation-delay-100"
                              : "animation-delay-200",
                          )}
                          style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Responsive word with large pronunciation button */}
              <div className="text-center space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide drop-shadow-md leading-tight animate-fade-in text-center mobile-safe-text">
                    {word.word}
                  </h2>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePronounce();
                    }}
                    disabled={isPlaying}
                    className={cn(
                      "h-14 w-14 sm:h-12 sm:w-12 rounded-full transition-all duration-200 flex-shrink-0",
                      "bg-white/20 hover:bg-white/30 border-2 border-white/40",
                      "text-white hover:scale-105 active:scale-95",
                      "touch-target-large mobile-button-primary shadow-mobile",
                      "haptic-medium",
                      isPlaying &&
                        "bg-yellow-400/30 border-yellow-300/60 animate-pulse",
                    )}
                    aria-label="Pronounce word"
                  >
                    <Volume2 className="w-7 h-7 sm:w-6 sm:h-6" />
                  </Button>
                </div>

                {word.pronunciation && (
                  <p className="text-base sm:text-lg opacity-90 font-medium leading-tight mobile-safe-text">
                    {word.pronunciation}
                  </p>
                )}
              </div>
            </div>

            {/* Kid-friendly gesture hints */}
            <div className="mt-2 sm:mt-3 text-center">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-2 sm:px-4 sm:py-2 mx-auto w-fit animate-gentle-bounce">
                <p className="text-xs sm:text-sm opacity-90 leading-tight font-medium mobile-safe-text">
                  <RotateCcw className="w-3 h-3 inline mr-1 animate-wiggle" />
                  Tap to see more fun! 🎉
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BACK CARD - Mobile-Optimized Design */}
        <Card
          className={cn(
            "absolute inset-0 w-full h-full backface-hidden rotate-y-180",
            "bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl overflow-hidden shadow-xl",
            isFlipped && "z-10",
          )}
        >
          <CardContent className="p-1 sm:p-2 h-full flex flex-col text-white relative overflow-hidden">
            {/* Scrollable content container */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden mobile-parent-dashboard scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {/* Compact mobile header with flip button */}
              <div className="flex items-center justify-between gap-1 sm:gap-2 mb-2 px-2 sm:px-3 py-2 flex-shrink-0 touch-optimized">
                <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                  <span className="text-base sm:text-lg animate-gentle-bounce flex-shrink-0">
                    {word.emoji}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold mobile-safe-text truncate">
                    {word.word}
                  </h3>
                </div>
                {/* Dedicated flip back button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFlip();
                  }}
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-white flex-shrink-0 touch-target haptic-light"
                  aria-label="Flip back to word"
                >
                  <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>

              {/* Mobile content sections */}
              <div className="space-y-2 px-2 sm:px-3 pb-2">
                {/* Compact definition */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20 relative game-surface-dark">
                  <h4 className="text-xs font-medium mb-1 text-yellow-300 flex items-center gap-1">
                    💡 Meaning:
                  </h4>
                  <p className="text-xs leading-relaxed mobile-safe-text break-words">
                    {word.definition}
                  </p>
                </div>

                {/* Compact example */}
                {word.example && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20 game-surface-dark">
                    <h4 className="text-xs font-medium mb-1 text-green-300 flex items-center gap-1">
                      📝 Example:
                    </h4>
                    <p className="text-xs italic leading-relaxed mobile-safe-text break-words">
                      "{word.example}"
                    </p>
                  </div>
                )}

                {/* Compact fun fact */}
                {word.funFact && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20 relative game-surface-dark">
                    <h4 className="text-xs font-medium mb-1 text-pink-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 animate-sparkle" />
                      🎈 Fun:
                    </h4>
                    <p className="text-xs leading-relaxed mobile-safe-text break-words">
                      {word.funFact}
                    </p>
                  </div>
                )}

                {/* Mobile-Optimized Rating Buttons */}
                {showVocabularyBuilder && (
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-2 border-2 border-white/30 game-surface-dark">
                    <div className="text-center mb-3">
                      <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 border border-white/30">
                        <span className="text-lg animate-bounce">⭐</span>
                        <h4 className="text-xs sm:text-sm font-bold text-white mobile-safe-text">
                          How was this word?
                        </h4>
                        <span className="text-lg animate-bounce animation-delay-200">
                          ⭐
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                      {/* Hard Button */}
                      <div className="flex flex-col items-center space-y-1">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRating("hard");
                            if (navigator.vibrate) {
                              navigator.vibrate([100, 50, 100]);
                            }
                          }}
                          className={cn(
                            "w-full h-12 sm:h-14 bg-gradient-to-b from-red-400/30 to-red-600/30 hover:from-red-400/50 hover:to-red-600/50 active:from-red-400/60 active:to-red-600/60 border border-red-400/50 hover:border-red-400/70 text-white font-bold mobile-safe-text touch-target-large haptic-medium transition-all duration-300 flex flex-col items-center justify-center gap-0.5 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 rating-button-enhanced",
                            ratedAs === "hard" &&
                              "ring-2 ring-red-300 ring-opacity-75 scale-105 from-red-400/70 to-red-600/70 border-red-300",
                            showCelebration &&
                              ratedAs === "hard" &&
                              "rating-glow rating-celebration",
                          )}
                          aria-label="Mark word as hard - I need more practice"
                        >
                          <span
                            className={cn(
                              "text-lg sm:text-xl",
                              ratedAs === "hard" && showCelebration
                                ? "rating-emoji-dance"
                                : "animate-wiggle",
                            )}
                          >
                            😅
                          </span>
                          <span className="text-xs font-bold leading-tight">
                            Hard
                          </span>
                        </Button>
                        <p className="text-xs text-white/80 text-center leading-tight mobile-safe-text hidden sm:block">
                          Need practice!
                        </p>
                      </div>

                      {/* OK Button */}
                      <div className="flex flex-col items-center space-y-1">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRating("medium");
                            if (navigator.vibrate) {
                              navigator.vibrate([60, 30, 60]);
                            }
                          }}
                          className={cn(
                            "w-full h-12 sm:h-14 bg-gradient-to-b from-yellow-400/30 to-orange-500/30 hover:from-yellow-400/50 hover:to-orange-500/50 active:from-yellow-400/60 active:to-orange-500/60 border border-yellow-400/50 hover:border-yellow-400/70 text-white font-bold mobile-safe-text touch-target-large haptic-medium transition-all duration-300 flex flex-col items-center justify-center gap-0.5 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 rating-button-enhanced",
                            ratedAs === "medium" &&
                              "ring-2 ring-yellow-300 ring-opacity-75 scale-105 from-yellow-400/70 to-orange-500/70 border-yellow-300",
                            showCelebration &&
                              ratedAs === "medium" &&
                              "rating-glow rating-celebration",
                          )}
                          aria-label="Mark word as okay - I know it a little"
                        >
                          <span
                            className={cn(
                              "text-lg sm:text-xl",
                              ratedAs === "medium" && showCelebration
                                ? "rating-emoji-dance"
                                : "animate-gentle-bounce",
                            )}
                          >
                            🤔
                          </span>
                          <span className="text-xs font-bold leading-tight">
                            OK
                          </span>
                        </Button>
                        <p className="text-xs text-white/80 text-center leading-tight mobile-safe-text hidden sm:block">
                          Getting there!
                        </p>
                      </div>

                      {/* Easy Button */}
                      <div className="flex flex-col items-center space-y-1">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRating("easy");
                            if (navigator.vibrate) {
                              navigator.vibrate([30, 10, 30, 10, 30]);
                            }
                          }}
                          className={cn(
                            "w-full h-12 sm:h-14 bg-gradient-to-b from-green-400/30 to-emerald-600/30 hover:from-green-400/50 hover:to-emerald-600/50 active:from-green-400/60 active:to-emerald-600/60 border border-green-400/50 hover:border-green-400/70 text-white font-bold mobile-safe-text touch-target-large haptic-heavy transition-all duration-300 flex flex-col items-center justify-center gap-0.5 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 rating-button-enhanced",
                            ratedAs === "easy" &&
                              "ring-2 ring-green-300 ring-opacity-75 scale-105 from-green-400/70 to-emerald-600/70 border-green-300",
                            showCelebration &&
                              ratedAs === "easy" &&
                              "rating-glow rating-celebration",
                          )}
                          aria-label="Mark word as easy - I know it well"
                        >
                          <span
                            className={cn(
                              "text-lg sm:text-xl",
                              ratedAs === "easy" && showCelebration
                                ? "rating-emoji-dance"
                                : "animate-celebration-sparkles",
                            )}
                          >
                            🎉
                          </span>
                          <span className="text-xs font-bold leading-tight">
                            Easy
                          </span>
                        </Button>
                        <p className="text-xs text-white/80 text-center leading-tight mobile-safe-text hidden sm:block">
                          I know it!
                        </p>
                      </div>
                    </div>

                    {/* Compact encouragement text */}
                    <div className="mt-2 text-center">
                      <div className="bg-white/10 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20">
                        <p className="text-xs text-white/90 mobile-safe-text animate-fade-in">
                          <span className="animate-sparkle">✨</span> Choose how
                          you feel!{" "}
                          <span className="animate-sparkle animation-delay-100">
                            ✨
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed navigation hint at bottom */}
            <div className="px-2 sm:px-3 py-2 flex-shrink-0 text-center safe-area-padding-bottom">
              <div
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-2 py-1 mx-auto w-fit animate-gentle-bounce cursor-pointer hover:bg-white/20 transition-colors touch-target"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFlip();
                }}
                role="button"
                tabIndex={0}
                aria-label="Flip to front of card"
              >
                <p className="text-xs text-white/90 mobile-safe-text flex items-center justify-center gap-1">
                  <RotateCcw
                    className="w-3 h-3 animate-spin"
                    style={{ animationDuration: "3s" }}
                  />
                  Tap to flip back
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Screen reader announcements */}
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
      </div>
    </div>
  );
};
