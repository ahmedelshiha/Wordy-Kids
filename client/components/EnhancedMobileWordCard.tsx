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
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  MoreVertical,
  Settings,
  Maximize,
  X,
} from "lucide-react";
import { playSoundIfEnabled } from "@/lib/soundEffects";
import { audioService } from "@/lib/audioService";
import { enhancedAudioService } from "@/lib/enhancedAudioService";
import { adventureService } from "@/lib/adventureService";
import { WordAdventureStatus } from "@shared/adventure";
import { AchievementTracker } from "@/lib/achievementTracker";
// EnhancedAchievementPopup removed - now using LightweightAchievementProvider
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

interface EnhancedMobileWordCardProps {
  word: Word;
  showDefinition?: boolean;
  onPronounce?: (word: Word) => void;
  onFavorite?: (word: Word) => void;
  onWordMastered?: (wordId: number, rating: "easy" | "medium" | "hard") => void;
  showVocabularyBuilder?: boolean;
  className?: string;
  enableGestures?: boolean;
  fullscreenMode?: boolean;
  onFullscreenToggle?: () => void;
  accessibilityMode?: boolean;
}

export const EnhancedMobileWordCard: React.FC<EnhancedMobileWordCardProps> = ({
  word,
  showDefinition = false,
  onPronounce,
  onFavorite,
  onWordMastered,
  showVocabularyBuilder = false,
  className = "",
  enableGestures = true,
  fullscreenMode = false,
  onFullscreenToggle,
  accessibilityMode = false,
}) => {
  const [isFlipped, setIsFlipped] = useState(showDefinition);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [adventureStatus, setAdventureStatus] =
    useState<WordAdventureStatus | null>(null);
  // wordAchievements state removed - now using event-based system
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [isGesturing, setIsGesturing] = useState(false);
  const [gestureHint, setGestureHint] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const pronunciationRef = useRef<HTMLButtonElement>(null);

  // Voice settings integration
  const voiceSettings = useVoiceSettings();

  // Initialize adventure status
  useEffect(() => {
    let status = adventureService.getWordAdventureStatus(word.id.toString());
    if (!status) {
      status = adventureService.initializeWordAdventure(word.id.toString());
    }
    setAdventureStatus(status);
  }, [word.id]);

  // Enhanced touch gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableGestures) return;

    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setIsGesturing(true);

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enableGestures || !touchStart) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // Show gesture hints
    if (Math.abs(deltaX) > 30 || Math.abs(deltaY) > 30) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          setGestureHint("→ Flip card");
        } else {
          setGestureHint("← Add to favorites");
        }
      } else if (deltaY < 0) {
        setGestureHint("↑ Pronounce word");
      } else {
        setGestureHint("↓ Show more info");
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!enableGestures || !touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const threshold = 60;

    setGestureHint(null);
    setIsGesturing(false);

    // Handle swipe gestures
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        // Swipe right - flip card
        handleCardFlip();
      } else {
        // Swipe left - favorite
        handleFavorite();
      }
    } else if (Math.abs(deltaY) > threshold) {
      if (deltaY < 0) {
        // Swipe up - pronounce
        handlePronounce();
      } else {
        // Swipe down - expand info
        setIsExpanded(!isExpanded);
      }
    }

    setTouchStart(null);
  };

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
    audioService.playWhooshSound();

    // Enhanced haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }

    // Announce to screen readers
    if (accessibilityMode && "speechSynthesis" in window) {
      const message = isFlipped
        ? `Showing word ${word.word}`
        : `Showing definition for ${word.word}`;
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.volume = 0.3;
      speechSynthesis.speak(utterance);
    }
  };

  const handlePronounce = async () => {
    if (isPlaying) return;

    setIsPlaying(true);
    setShowSparkles(true);

    // Enhanced haptic feedback for pronunciation
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 100]);
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

        // Track pronunciation activity
        const pronunciationAchievements = AchievementTracker.trackActivity({
          type: "wordLearning",
          wordsLearned: 0,
          category: word.category,
          timeSpent: 0.1,
        });

        if (pronunciationAchievements.length > 0) {
          // Trigger achievements through new event system
          setTimeout(() => {
            pronunciationAchievements.forEach((achievement) => {
              const event = new CustomEvent("milestoneUnlocked", {
                detail: { achievement },
              });
              window.dispatchEvent(event);
            });
          }, 1000);
        }
      },
      onError: () => {
        setIsPlaying(false);
        setShowSparkles(false);
        playSoundIfEnabled.pronunciation();
      },
    });

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

      // Strong haptic feedback for favoriting
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    } else {
      playSoundIfEnabled.click();
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
    onFavorite?.(word);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Learn: ${word.word}`,
          text: `${word.definition}\n\nExample: ${word.example || "No example available"}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled or failed");
      }
    } else if (navigator.clipboard) {
      const shareText = `${word.word}: ${word.definition}`;
      await navigator.clipboard.writeText(shareText);
      // Show toast or feedback
    }
  };

  // Enhanced category color mapping for all 20 categories
  const getCategoryColor = (category: string) => {
    const colors = {
      // Core categories
      food: "from-red-400 to-orange-500",
      animals: "from-blue-400 to-blue-600",
      nature: "from-green-400 to-green-600",
      objects: "from-purple-400 to-purple-600",
      body: "from-pink-400 to-pink-600",

      // Extended categories
      clothes: "from-indigo-400 to-indigo-600",
      family: "from-yellow-400 to-amber-500",
      feelings: "from-rose-400 to-rose-600",
      colors: "from-violet-400 to-purple-500",
      numbers: "from-cyan-400 to-blue-500",

      // Additional categories
      greetings: "from-emerald-400 to-green-500",
      technology: "from-slate-400 to-gray-600",
      actions: "from-orange-400 to-red-500",
      weather: "from-sky-400 to-blue-500",
      transportation: "from-yellow-500 to-orange-500",

      // Educational categories
      school: "from-blue-500 to-indigo-600",
      emotions: "from-pink-500 to-rose-500",
      toys: "from-purple-500 to-pink-500",
      music: "from-violet-500 to-purple-600",
      sports: "from-green-500 to-emerald-600",
    };
    return (
      colors[category as keyof typeof colors] || "from-blue-400 to-purple-600"
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500 text-white shadow-green-500/25";
      case "medium":
        return "bg-orange-500 text-white shadow-orange-500/25";
      case "hard":
        return "bg-red-500 text-white shadow-red-500/25";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!accessibilityMode) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          handleCardFlip();
          break;
        case "p":
        case "P":
          e.preventDefault();
          handlePronounce();
          break;
        case "f":
        case "F":
          e.preventDefault();
          handleFavorite();
          break;
        case "Enter":
          e.preventDefault();
          handleCardFlip();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [accessibilityMode]);

  return (
    <div
      ref={cardRef}
      className={`relative w-full ${fullscreenMode ? "h-screen" : "max-w-xs sm:max-w-sm"} mx-auto ${className}`}
    >
      {/* Accessibility Panel */}
      {showAccessibilityPanel && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-black/90 text-white p-4 rounded-t-xl">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold">Accessibility Controls</h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAccessibilityPanel(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p>
                <kbd className="bg-gray-700 px-2 py-1 rounded">Space</kbd> Flip
                card
              </p>
              <p>
                <kbd className="bg-gray-700 px-2 py-1 rounded">P</kbd> Pronounce
              </p>
            </div>
            <div>
              <p>
                <kbd className="bg-gray-700 px-2 py-1 rounded">F</kbd> Favorite
              </p>
              <p>
                <kbd className="bg-gray-700 px-2 py-1 rounded">Enter</kbd>{" "}
                Activate
              </p>
            </div>
          </div>

          {enableGestures && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-xs text-white/80">Swipe gestures enabled:</p>
              <div className="flex gap-4 text-xs mt-1">
                <span>← Favorite</span>
                <span>→ Flip</span>
                <span>↑ Pronounce</span>
                <span>↓ Expand</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gesture hint overlay */}
      {gestureHint && isGesturing && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium pointer-events-none">
          {gestureHint}
        </div>
      )}

      <Card
        className={`${fullscreenMode ? "h-full" : "h-[420px] sm:h-[400px] md:h-[380px]"} cursor-pointer transition-all duration-500 transform-gpu ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        } ${
          adventureStatus && adventureStatus.health < 30
            ? "ring-2 ring-red-400/50 shadow-red-400/20 shadow-xl animate-pulse"
            : adventureStatus && adventureStatus.health < 50
              ? "ring-2 ring-orange-400/50 shadow-orange-400/20 shadow-lg"
              : "shadow-xl hover:shadow-2xl"
        } ${isGesturing ? "scale-[1.02]" : "hover:scale-[1.01]"}`}
        style={{
          touchAction: enableGestures ? "pan-y" : "auto",
        }}
        onClick={handleCardFlip}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="button"
        tabIndex={0}
        aria-label={`Word card for ${word.word}. ${isFlipped ? "Showing definition" : "Showing word"}. Press space to flip.`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardFlip();
          }
        }}
      >
        {/* Front of card - Enhanced Mobile Design */}
        <CardContent
          className={`absolute inset-0 w-full h-full bg-gradient-to-br ${getCategoryColor(word.category)} rounded-xl p-4 sm:p-5 flex flex-col text-white`}
          style={{ willChange: "transform" }}
        >
          {/* Enhanced Header with Better Mobile Layout */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-wrap gap-2 flex-1">
              <Badge
                className={`${getDifficultyColor(word.difficulty)} text-xs font-medium px-3 py-1.5 shadow-lg`}
              >
                {word.difficulty === "easy"
                  ? "🌟 Easy"
                  : word.difficulty === "medium"
                    ? "⭐ Medium"
                    : "🔥 Hard"}
              </Badge>

              <Badge
                variant="outline"
                className="bg-white/70 border-white/50 text-gray-800 text-xs px-3 py-1.5 backdrop-blur-sm font-semibold"
              >
                {word.category}
              </Badge>

              {/* Adventure Health Status */}
              {adventureStatus && (
                <Badge
                  variant="outline"
                  className={`text-xs flex items-center gap-1.5 px-2.5 py-1.5 ${
                    adventureStatus.health >= 80
                      ? "bg-green-500/25 border-green-400/60 text-green-100"
                      : adventureStatus.health >= 50
                        ? "bg-yellow-500/25 border-yellow-400/60 text-yellow-100"
                        : adventureStatus.health >= 30
                          ? "bg-orange-500/25 border-orange-400/60 text-orange-100"
                          : "bg-red-500/25 border-red-400/60 text-red-100 animate-pulse"
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

            {/* Enhanced Action Buttons */}
            <div className="flex gap-2 ml-2">
              {accessibilityMode && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-200 hover:bg-white/40 hover:text-gray-800 p-2 min-w-[44px] min-h-[44px] rounded-full backdrop-blur-sm transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAccessibilityPanel(!showAccessibilityPanel);
                  }}
                  aria-label="Accessibility options"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                className="text-gray-200 hover:bg-white/40 hover:text-gray-800 p-2 min-w-[44px] min-h-[44px] rounded-full backdrop-blur-sm transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                aria-label={`Share ${word.word}`}
              >
                <Share className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className={`text-gray-200 hover:bg-white/40 hover:text-gray-800 p-2 min-w-[44px] min-h-[44px] rounded-full backdrop-blur-sm transition-all duration-300 ${
                  isFavorited ? "scale-110 text-red-300 bg-red-500/40" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavorite();
                }}
                aria-label={
                  isFavorited
                    ? `Remove ${word.word} from favorites`
                    : `Add ${word.word} to favorites`
                }
              >
                <Heart
                  className={`w-4 h-4 transition-all duration-300 ${isFavorited ? "fill-current" : ""}`}
                />
                {showSparkles && isFavorited && (
                  <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-spin" />
                )}
              </Button>

              {fullscreenMode && onFullscreenToggle && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-200 hover:bg-white/40 hover:text-gray-800 p-2 min-w-[44px] min-h-[44px] rounded-full backdrop-blur-sm transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFullscreenToggle();
                  }}
                  aria-label="Exit fullscreen"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Enhanced Image/Emoji Container with Better Animations */}
          <div className="relative mx-auto mb-4 group">
            <div
              className={`${fullscreenMode ? "w-40 h-40 sm:w-48 sm:h-48" : "w-32 h-32 sm:w-36 sm:h-36"} rounded-full bg-gradient-to-br from-white/30 via-white/20 to-white/10 backdrop-blur-md shadow-2xl ring-4 ring-white/30 flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:shadow-3xl`}
            >
              {/* Enhanced decorative elements */}
              <div className="absolute top-2 left-2 w-3 h-3 bg-white/25 rounded-full animate-pulse"></div>
              <div className="absolute bottom-3 right-3 w-2 h-2 bg-white/20 rounded-full animate-bounce delay-300"></div>
              <div className="absolute top-1/2 right-2 w-1.5 h-1.5 bg-white/30 rounded-full animate-ping delay-700"></div>
              <div className="absolute top-3 right-1/3 w-1 h-1 bg-white/25 rounded-full animate-pulse delay-500"></div>

              {word.imageUrl ? (
                <img
                  src={word.imageUrl}
                  alt={word.word}
                  className="w-full h-full object-cover rounded-full shadow-lg transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              ) : (
                <span
                  className={`${fullscreenMode ? "text-7xl sm:text-8xl" : "text-5xl sm:text-6xl"} relative z-10 drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 select-none`}
                >
                  {word.emoji || "📚"}
                </span>
              )}

              {/* Enhanced glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/5 to-white/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Ripple effect for touch feedback */}
              {isGesturing && (
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
              )}
            </div>
          </div>

          {/* Enhanced Word and Pronunciation Section */}
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
            <h2
              className={`${fullscreenMode ? "text-3xl sm:text-4xl md:text-5xl" : "text-xl sm:text-2xl md:text-3xl"} font-bold tracking-wide drop-shadow-lg transition-all duration-300`}
            >
              {word.word}
            </h2>

            {word.pronunciation && (
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <span
                  className={`${fullscreenMode ? "text-lg sm:text-xl" : "text-sm sm:text-base"} opacity-90 font-medium drop-shadow-sm`}
                >
                  {word.pronunciation}
                </span>

                <Button
                  ref={pronunciationRef}
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePronounce();
                  }}
                  disabled={isPlaying}
                  className={`text-gray-200 hover:bg-white/60 hover:text-gray-800 hover:scale-110 p-3 min-w-[52px] min-h-[52px] rounded-full transition-all duration-300 border-2 border-white/50 bg-white/30 backdrop-blur-sm shadow-lg ${
                    isPlaying
                      ? "scale-125 bg-yellow-400/60 border-yellow-300/70 shadow-yellow-300/40 animate-bounce text-gray-800"
                      : "hover:border-white/70 hover:shadow-xl"
                  }`}
                  aria-label={`Pronounce ${word.word}`}
                >
                  <Volume2
                    className={`w-6 h-6 transition-all duration-300 ${
                      isPlaying
                        ? "text-yellow-200 animate-pulse scale-110"
                        : "text-white"
                    }`}
                  />

                  {showSparkles && (
                    <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300 animate-spin" />
                  )}

                  {isPlaying && (
                    <>
                      <div className="absolute inset-0 rounded-full border-2 border-yellow-300/60 animate-ping"></div>
                      <div className="absolute inset-0 rounded-full border-2 border-yellow-300/40 animate-ping delay-75"></div>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Enhanced Footer with Gesture Hints */}
          <div className="text-center space-y-3">
            {adventureStatus && (
              <p className="text-xs opacity-70 font-medium">
                Last seen:{" "}
                {new Date(adventureStatus.last_seen).toLocaleDateString()}
              </p>
            )}

            <div className="space-y-2">
              <p className="text-xs sm:text-sm opacity-80 font-medium flex items-center justify-center gap-2">
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                Tap to see definition
              </p>

              {enableGestures && !fullscreenMode && (
                <div className="flex justify-center gap-4 text-xs opacity-70">
                  <span className="flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" /> Favorite
                  </span>
                  <span className="flex items-center gap-1">
                    <ArrowUp className="w-3 h-3" /> Speak
                  </span>
                  <span className="flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" /> Flip
                  </span>
                </div>
              )}
            </div>

            {/* Enhanced loading indicators */}
            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </CardContent>

        {/* Enhanced Back of card with Better Content Layout */}
        <CardContent
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-xl p-4 sm:p-5 flex flex-col text-white"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          {/* Enhanced Back Header */}
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`${fullscreenMode ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"} font-bold flex items-center gap-2`}
            >
              {word.word} {word.emoji}
            </h3>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 p-2 min-w-[44px] min-h-[44px] rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  // Bookmark functionality
                }}
                aria-label={`Bookmark ${word.word}`}
              >
                <Bookmark className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 p-2 min-w-[44px] min-h-[44px] rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardFlip();
                }}
                aria-label="Return to word view"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Enhanced Content Sections */}
          <div className="space-y-4 flex-1 overflow-y-auto">
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg p-3 border border-blue-500/30">
                <h4 className="text-sm font-semibold mb-2 text-blue-300 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Definition
                </h4>
                <p
                  className={`${fullscreenMode ? "text-base sm:text-lg" : "text-sm sm:text-base"} leading-relaxed text-blue-100`}
                >
                  {word.definition}
                </p>
              </div>

              {word.example && (
                <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg p-3 border border-green-500/30">
                  <h4 className="text-sm font-semibold mb-2 text-green-300 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Example
                  </h4>
                  <p
                    className={`${fullscreenMode ? "text-base sm:text-lg" : "text-sm"} italic text-green-100 leading-relaxed`}
                  >
                    "{word.example}"
                  </p>
                </div>
              )}

              {word.funFact && (
                <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-lg p-3 border border-purple-500/30">
                  <h4 className="text-sm font-semibold mb-2 text-purple-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Fun Fact
                  </h4>
                  <p
                    className={`${fullscreenMode ? "text-sm sm:text-base" : "text-xs sm:text-sm"} text-purple-100 leading-relaxed`}
                  >
                    {word.funFact}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Vocabulary Builder Section */}
          {showVocabularyBuilder && (
            <div className="border-t border-white/20 pt-4 mt-4 space-y-4">
              {/* Word Health Progress */}
              <div className="bg-gradient-to-r from-slate-600/50 to-slate-700/50 rounded-lg p-3 border border-slate-500/30">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
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
                      <AlertTriangle className="w-4 h-4 text-orange-300 animate-pulse" />
                    )}
                  </div>
                </div>

                <Progress
                  value={adventureStatus?.health || 100}
                  className={`h-3 ${
                    (adventureStatus?.health || 100) >= 50
                      ? "bg-green-100/20"
                      : (adventureStatus?.health || 100) >= 30
                        ? "bg-orange-100/20"
                        : "bg-red-100/20"
                  }`}
                />

                <div className="mt-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {(adventureStatus?.health || 100) < 30 ? (
                      <>
                        <Flame className="w-4 h-4 text-red-400 animate-pulse" />
                        <span className="text-red-300 font-medium">
                          Needs Rescue!
                        </span>
                      </>
                    ) : (adventureStatus?.health || 100) < 50 ? (
                      <>
                        <Target className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-300">Needs Practice</span>
                      </>
                    ) : (adventureStatus?.health || 100) < 80 ? (
                      <>
                        <Shield className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-300">Good Progress</span>
                      </>
                    ) : null}
                  </div>
                  <span className="text-white/60">
                    Missed {adventureStatus?.forget_count || 0}x
                  </span>
                </div>
              </div>

              {/* Enhanced Rating Buttons */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-purple-300 flex items-center gap-2">
                  <Sword className="w-4 h-4" />
                  Rate Your Knowledge
                </h4>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="bg-red-500/25 hover:bg-red-500/40 active:bg-red-500/50 text-red-200 border border-red-500/40 transition-all active:scale-95 min-h-[48px] text-xs font-medium"
                    onClick={(e) => {
                      e.stopPropagation();

                      if (navigator.vibrate) {
                        navigator.vibrate([100, 50, 100]);
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
                    <ThumbsDown className="w-3 h-3 mb-1" />
                    Forgot
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="bg-yellow-500/25 hover:bg-yellow-500/40 active:bg-yellow-500/50 text-yellow-200 border border-yellow-500/40 transition-all active:scale-95 min-h-[48px] text-xs font-medium"
                    onClick={(e) => {
                      e.stopPropagation();

                      if (navigator.vibrate) {
                        navigator.vibrate([75]);
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
                    <Star className="w-3 h-3 mb-1" />
                    Kinda
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="bg-green-500/25 hover:bg-green-500/40 active:bg-green-500/50 text-green-200 border border-green-500/40 transition-all active:scale-95 min-h-[48px] text-xs font-medium"
                    onClick={(e) => {
                      e.stopPropagation();

                      if (navigator.vibrate) {
                        navigator.vibrate([50, 25, 50]);
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
                    <ThumbsUp className="w-3 h-3 mb-1" />
                    Easy!
                  </Button>
                </div>

                {/* Rescue Action for Low Health Words */}
                {(adventureStatus?.health || 100) < 50 && (
                  <div className="mt-4 p-3 bg-orange-500/15 rounded-lg border border-orange-500/30">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                        <span className="text-xs text-orange-300 font-medium">
                          This word needs extra practice!
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-orange-500/30 hover:bg-orange-500/40 active:bg-orange-500/50 text-orange-200 border border-orange-500/40 px-3 py-2 text-xs min-h-[40px] transition-all active:scale-95"
                        onClick={(e) => {
                          e.stopPropagation();
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

      {/* Achievement popups now handled by LightweightAchievementProvider */}

      {/* Screen reader live region */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {isFlipped
          ? `Showing definition for ${word.word}`
          : `Showing word ${word.word}`}
        {isPlaying && `Pronouncing ${word.word}`}
        {isFavorited && `${word.word} added to favorites`}
      </div>
    </div>
  );
};
