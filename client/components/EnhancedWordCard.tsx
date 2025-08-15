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
  onFavorite?: (word: Word) => void;
  onWordMastered?: (wordId: number, rating: "easy" | "medium" | "hard") => void;
  showVocabularyBuilder?: boolean;
  className?: string;
}

type MiniGame = "sound-match" | "emoji-builder" | "letter-hunt" | null;

export const EnhancedWordCard: React.FC<EnhancedWordCardProps> = ({
  word,
  showDefinition = false,
  onPronounce,
  onFavorite,
  onWordMastered,
  showVocabularyBuilder = false,
  className = "",
}) => {
  // Core states
  const [isFlipped, setIsFlipped] = useState(showDefinition);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Audio and interaction states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  // Progress states
  const [starProgress, setStarProgress] = useState(0);





  const cardRef = useRef<HTMLDivElement>(null);
  const voiceSettings = useVoiceSettings();

  // Initialize favorites from localStorage
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favoriteWords") || "[]");
    setIsFavorited(favorites.includes(word.id));
  }, [word.id]);


  // Star progress calculation
  useEffect(() => {
    let progress = 0;
    if (isPlaying) progress += 1; // heard pronunciation
    if (isFlipped) progress += 1; // viewed back
    setStarProgress(progress);
  }, [isPlaying, isFlipped]);

  // Enhanced pronunciation with normal voice
  const handlePronounce = async () => {
    if (isPlaying) return;

    setIsPlaying(true);
    setShowSparkles(true);

    // Trigger star progress
    const newProgress = Math.min(starProgress + 1, 3);
    setStarProgress(newProgress);

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


  // Enhanced favorite handling with sparkles
  const handleFavorite = () => {
    const newFavorited = !isFavorited;
    setIsFavorited(newFavorited);

    // Save to localStorage
    const favorites = JSON.parse(localStorage.getItem("favoriteWords") || "[]");
    if (newFavorited) {
      favorites.push(word.id);
      enhancedAudioService.playSuccessSound();
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 1000);

      // Enhanced haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } else {
      const index = favorites.indexOf(word.id);
      if (index > -1) {
        favorites.splice(index, 1);
      }
      playUIInteractionSoundIfEnabled.click();
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }

    localStorage.setItem("favoriteWords", JSON.stringify(favorites));
    onFavorite?.(word);
  };

  // Smooth 3D flip
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    audioService.playWhooshSound();

    if (navigator.vibrate) {
      navigator.vibrate([30, 20, 30]);
    }
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
    <div className={cn("relative w-full max-w-[380px] mx-auto", className)}>
      {/* 3D Card Container with smooth flip */}
      <div
        ref={cardRef}
        className={cn(
          "relative w-full h-[420px] transition-all duration-700 transform-gpu preserve-3d",
          isFlipped && "rotate-y-180",
        )}
        style={{
          transformStyle: "preserve-3d",
          perspective: "1000px",
        }}
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label={`Word card for ${word.word}. ${isFlipped ? "Showing definition" : "Showing word"}. Tap to flip or swipe for actions.`}
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
          <CardContent className="p-4 h-full flex flex-col text-white relative">
            {/* Header with badges and star meter */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex flex-wrap gap-1">
                <Badge
                  className={getDifficultyColor(word.difficulty)}
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
                  className="bg-white/20 border-white/30 text-white text-xs"
                >
                  {word.category}
                </Badge>
              </div>

              {/* Star Progress Meter */}
              <div className="flex items-center gap-1">
                {[1, 2].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-5 h-5 transition-all duration-300",
                      star <= starProgress
                        ? "text-yellow-300 fill-yellow-300 animate-pulse"
                        : "text-white/30",
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Large emoji with animation */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative mb-4">
                <div className="w-40 h-40 rounded-full bg-white/20 backdrop-blur-md shadow-lg ring-1 ring-white/30 flex items-center justify-center relative overflow-hidden animate-gentle-float">
                  {/* Decorative particles */}
                  <div className="absolute top-2 left-2 w-3 h-3 bg-white/20 rounded-full animate-sparkle"></div>
                  <div className="absolute bottom-3 right-3 w-2 h-2 bg-white/15 rounded-full animate-bounce delay-300"></div>
                  <div className="absolute top-1/2 right-2 w-2 h-2 bg-white/25 rounded-full animate-ping delay-700"></div>

                  {/* Main emoji - extra large and animated */}
                  <span className="text-8xl relative z-10 drop-shadow-lg animate-gentle-bounce">
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

              {/* Large word with pronunciation and heart buttons */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <h2 className="text-4xl font-bold tracking-wide drop-shadow-md leading-tight animate-fade-in">
                    {word.word}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePronounce();
                      }}
                      disabled={isPlaying}
                      className={cn(
                        "h-12 w-12 rounded-full transition-all duration-200 flex-shrink-0",
                        "bg-white/20 hover:bg-white/30 border-2 border-white/40",
                        "text-white hover:scale-105 active:scale-95",
                        isPlaying &&
                          "bg-yellow-400/30 border-yellow-300/60 animate-pulse",
                      )}
                    >
                      <Volume2 className="w-6 h-6" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavorite();
                      }}
                      className={cn(
                        "h-12 w-12 rounded-full transition-all duration-200 flex-shrink-0",
                        "bg-white/20 hover:bg-white/30 border-2 border-white/40",
                        "hover:scale-110 active:scale-95",
                        isFavorited && "bg-red-500/30 border-red-400/60",
                      )}
                    >
                      <Heart
                        className={cn(
                          "w-5 h-5",
                          isFavorited
                            ? "fill-red-400 text-red-400"
                            : "text-white",
                        )}
                      />
                    </Button>
                  </div>
                </div>

                {word.pronunciation && (
                  <p className="text-lg opacity-90 font-medium leading-tight">
                    {word.pronunciation}
                  </p>
                )}
              </div>
            </div>


            {/* Gesture hints */}
            <div className="mt-3 text-center">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mx-auto w-fit">
                <p className="text-sm opacity-90 leading-tight font-medium">
                  <RotateCcw className="w-3 h-3 inline mr-1" />
                  Tap to see more fun!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BACK CARD - Interactive Back Design */}
        <Card
          className={cn(
            "absolute inset-0 w-full h-full backface-hidden rotate-y-180",
            "bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl overflow-hidden shadow-xl",
            isFlipped && "z-10",
          )}
        >
          <CardContent className="p-4 h-full flex flex-col text-white relative overflow-y-auto">
            {/* Back header */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{word.emoji}</span>
              <h3 className="text-xl font-bold">{word.word}</h3>
            </div>

            {/* Mini-game or content view */}
            {activeMiniGame ? (
              <div className="flex-1 flex flex-col">
                {/* Mini-game header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold">
                      {activeMiniGame === "sound-match" && "🎧 Sound Match"}
                      {activeMiniGame === "emoji-builder" && "🧩 Emoji Builder"}
                      {activeMiniGame === "letter-hunt" && "🔤 Letter Hunt"}
                    </h4>
                    <Button
                      onClick={() => setActiveMiniGame(null)}
                      className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 p-0"
                    >
                      ✕
                    </Button>
                  </div>
                  <Progress value={miniGameProgress} className="h-2" />
                </div>

                {/* Sound Match Game */}
                {activeMiniGame === "sound-match" && (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <div className="text-center">
                      <p className="text-lg mb-4">
                        Listen and match the sound!
                      </p>
                      <Button
                        onClick={handleSoundMatch}
                        className="h-16 w-16 rounded-full bg-blue-500/30 hover:bg-blue-500/50 text-3xl"
                      >
                        🔊
                      </Button>
                    </div>
                  </div>
                )}

                {/* Emoji Builder Game */}
                {activeMiniGame === "emoji-builder" && (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <div className="text-center">
                      <p className="text-lg mb-4">
                        Build the emoji by clicking the pieces!
                      </p>
                      <div className="text-6xl mb-4">
                        {emojiPieces.every(Boolean) ? word.emoji : "❓"}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {emojiPieces.map((filled, index) => (
                          <Button
                            key={index}
                            onClick={() => handleEmojiPieceClick(index)}
                            className={cn(
                              "h-12 w-12 rounded-lg",
                              filled
                                ? "bg-green-500/50 border-green-400"
                                : "bg-white/20 hover:bg-white/30 border-white/40",
                            )}
                            disabled={filled}
                          >
                            {filled ? "✓" : "🧩"}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Letter Hunt Game */}
                {activeMiniGame === "letter-hunt" && (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <div className="text-center">
                      <p className="text-lg mb-4">
                        Tap letters in order to spell "{word.word}"
                      </p>
                      <div className="text-2xl mb-4">
                        {letterSequence.map((letter, index) => (
                          <span
                            key={index}
                            className={cn(
                              "inline-block w-8 h-8 mx-1 text-center border-2 rounded",
                              index < currentLetterIndex
                                ? "bg-green-500/50 border-green-400 text-green-100"
                                : index === currentLetterIndex
                                  ? "bg-yellow-500/50 border-yellow-400 text-yellow-100 animate-pulse"
                                  : "border-white/40",
                            )}
                          >
                            {index < currentLetterIndex ? letter : "_"}
                          </span>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-2 max-w-48">
                        {word.word
                          .split("")
                          .sort(() => Math.random() - 0.5)
                          .map((letter, index) => (
                            <Button
                              key={index}
                              onClick={() =>
                                handleLetterClick(
                                  letter,
                                  letterSequence.indexOf(letter),
                                )
                              }
                              className="h-12 w-12 rounded-lg bg-white/20 hover:bg-white/30 border border-white/40 text-lg font-bold"
                            >
                              {letter.toUpperCase()}
                            </Button>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Regular back content */
              <div className="flex-1 space-y-4">
                {/* Definition in comic bubble style */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 relative">
                  <div className="absolute -top-2 left-6 w-4 h-4 bg-white/10 border-l border-t border-white/20 transform rotate-45"></div>
                  <h4 className="text-sm font-medium mb-2 text-yellow-300">
                    What it means:
                  </h4>
                  <p className="text-base leading-relaxed">{word.definition}</p>
                </div>

                {/* Example sentence */}
                {word.example && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <h4 className="text-sm font-medium mb-2 text-green-300">
                      Example:
                    </h4>
                    <p className="text-base italic leading-relaxed">
                      "{word.example}"
                    </p>
                  </div>
                )}

                {/* Fun fact in comic bubble */}
                {word.funFact && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 relative">
                    <div className="absolute -top-2 right-6 w-4 h-4 bg-white/10 border-r border-t border-white/20 transform -rotate-45"></div>
                    <h4 className="text-sm font-medium mb-2 text-pink-300 flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      Fun Fact:
                    </h4>
                    <p className="text-sm leading-relaxed">{word.funFact}</p>
                  </div>
                )}

              {/* Vocabulary Builder section */}
              {showVocabularyBuilder && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <h4 className="text-sm font-medium mb-3 text-orange-300 flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    Rate Your Knowledge:
                  </h4>
                  <div className="flex gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onWordMastered?.(word.id, "hard");
                      }}
                      className="flex-1 h-10 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 text-xs"
                    >
                      <ThumbsDown className="w-3 h-3 mr-1" />
                      Forgot
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onWordMastered?.(word.id, "medium");
                      }}
                      className="flex-1 h-10 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-200 text-xs"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      Kinda
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onWordMastered?.(word.id, "easy");
                      }}
                      className="flex-1 h-10 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-200 text-xs"
                    >
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      Easy!
                    </Button>
                  </div>
                </div>
              )}
              </div>
            )}

            {/* Back navigation hint */}
            <div className="mt-4 text-center">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mx-auto w-fit">
                <p className="text-xs text-white/80">
                  <span className="animate-pulse">←</span> Tap anywhere to go
                  back
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Swipe direction feedback */}
      {isGesturing && swipeDirection && (
        <div className="absolute inset-0 pointer-events-none z-30 rounded-xl overflow-hidden">
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-200",
              swipeDirection === "right" &&
                "bg-gradient-to-r from-green-400/20 via-green-400/10 to-transparent",
              swipeDirection === "left" &&
                "bg-gradient-to-l from-red-400/20 via-red-400/10 to-transparent",
              swipeDirection === "up" &&
                "bg-gradient-to-t from-blue-400/20 via-blue-400/10 to-transparent",
              swipeDirection === "down" &&
                "bg-gradient-to-b from-purple-400/20 via-purple-400/10 to-transparent",
            )}
          />
        </div>
      )}

      {/* Achievement popup */}
      {wordAchievements.length > 0 && (
        <EnhancedAchievementPopup
          achievements={wordAchievements}
          onClose={() => setWordAchievements([])}
          onAchievementClaim={(achievement) => {
            console.log("Achievement claimed:", achievement);
          }}
          autoCloseDelay={3000}
        />
      )}

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
        {isFavorited && ` ${word.word} added to favorites`}
        {activeMiniGame && ` Playing ${activeMiniGame} game`}
        {starProgress > 0 && ` Earned ${starProgress} stars`}
      </div>
    </div>
  );
};
