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
  Leaf,
  TreePine,
  Sun,
  Zap,
  Crown,
  Trophy,
  Gem,
  Heart,
  Shield,
  Sword,
  Mountain,
  Bird,
  Flower2,
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

interface JungleAdventureWordCardProps {
  word: Word;
  showDefinition?: boolean;
  onPronounce?: (word: Word) => void;
  onWordMastered?: (wordId: number, rating: "easy" | "medium" | "hard") => void;
  showVocabularyBuilder?: boolean;
  className?: string;
  adventureLevel?: number;
  explorerBadges?: string[];
  isJungleQuest?: boolean;
}

export const JungleAdventureWordCard: React.FC<
  JungleAdventureWordCardProps
> = ({
  word,
  showDefinition = false,
  onPronounce,
  onWordMastered,
  showVocabularyBuilder = false,
  className = "",
  adventureLevel = 1,
  explorerBadges = [],
  isJungleQuest = false,
}) => {
  // Core states
  const [isFlipped, setIsFlipped] = useState(showDefinition);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMagicalSparkles, setShowMagicalSparkles] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ratedAs, setRatedAs] = useState<"easy" | "medium" | "hard" | null>(
    null,
  );
  const [showCelebration, setShowCelebration] = useState(false);
  const [showJungleParticles, setShowJungleParticles] = useState(false);
  const [explorerXP, setExplorerXP] = useState(0);
  const [isLevelingUp, setIsLevelingUp] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const voiceSettings = useVoiceSettings();

  // Jungle adventure effects - much lighter
  useEffect(() => {
    const interval = setInterval(() => {
      setShowJungleParticles(true);
      setTimeout(() => setShowJungleParticles(false), 800); // Reduced from 2000ms
    }, 15000); // Reduced frequency from 8000ms
    return () => clearInterval(interval);
  }, []);

  // Enhanced pronunciation with jungle sounds
  const handlePronounce = async () => {
    if (isPlaying) return;

    setIsPlaying(true);
    setShowMagicalSparkles(true);
    // Removed jungle particles for pronunciation to be lighter

    try {
      // Jungle adventure pronunciation
      enhancedAudioService.pronounceWord(word.word, {
        onStart: () => {
          playSoundIfEnabled.jungleAmbient?.();
          console.log("Jungle explorer pronunciation started");
        },
        onEnd: () => {
          setIsPlaying(false);
          setShowMagicalSparkles(false);
          setExplorerXP((prev) => prev + 10);
          onPronounce?.(word);
          playSoundIfEnabled.explorerReward?.();
        },
        onError: () => handlePronunciationError(),
      });
    } catch (error) {
      handlePronunciationError();
    }

    // Safety timeout with jungle sound
    setTimeout(() => {
      setIsPlaying(false);
      setShowMagicalSparkles(false);
    }, 3000);
  };

  const handlePronunciationError = () => {
    setIsPlaying(false);
    setShowMagicalSparkles(false);
    playSoundIfEnabled.pronunciation();
  };

  // Enhanced jungle adventure flip
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    audioService.playWhooshSound();
    playUIInteractionSoundIfEnabled.jungleLeafRustle?.() ||
      playUIInteractionSoundIfEnabled.whoosh();

    // Enhanced haptic feedback for jungle adventure
    if (navigator.vibrate) {
      navigator.vibrate([50, 20, 50, 20, 50]);
    }

    setIsPressed(true);
    // Removed jungle particles on flip to make it lighter
    setTimeout(() => {
      setIsPressed(false);
    }, 300);
  };

  // Jungle adventure rating with XP system
  const handleRating = (rating: "easy" | "medium" | "hard") => {
    setRatedAs(rating);
    setShowCelebration(true);
    // Only show particles for "easy" rating (I Remember equivalent)
    if (rating === "easy") {
      setShowJungleParticles(true);
    }

    // Calculate XP based on difficulty and rating
    let xpGained = 0;
    if (rating === "easy") {
      xpGained =
        word.difficulty === "hard"
          ? 100
          : word.difficulty === "medium"
            ? 75
            : 50;
      playSoundIfEnabled.explorerVictory?.() || playSoundIfEnabled.success();
      playSoundIfEnabled.levelUp();
    } else if (rating === "medium") {
      xpGained =
        word.difficulty === "hard"
          ? 60
          : word.difficulty === "medium"
            ? 40
            : 25;
      playSoundIfEnabled.explorerProgress?.() || playSoundIfEnabled.click();
    } else {
      xpGained = 20;
      playSoundIfEnabled.explorerEncouragement?.() ||
        playSoundIfEnabled.hover();
    }

    setExplorerXP((prev) => {
      const newXP = prev + xpGained;
      if (newXP > 0 && newXP % 200 === 0) {
        setIsLevelingUp(true);
        setTimeout(() => setIsLevelingUp(false), 3000);
        playSoundIfEnabled.explorerLevelUp?.() ||
          playSoundIfEnabled.achievement?.();
      }
      return newXP;
    });

    playUIInteractionSoundIfEnabled.jungleSuccess?.() ||
      playUIInteractionSoundIfEnabled.click();
    onWordMastered?.(word.id, rating);

    setTimeout(() => {
      setShowCelebration(false);
      setShowJungleParticles(false);
    }, 800); // Much shorter duration
  };

  // Touch handlers for mobile
  const handleTouchStart = () => {
    setIsPressed(true);
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const handleTouchEnd = () => {
    setTimeout(() => setIsPressed(false), 100);
  };

  // Get jungle-themed category colors
  const getJungleCategoryColor = (category: string) => {
    const jungleColors = {
      animals: "from-jungle via-green-500 to-emerald-600",
      food: "from-sunshine via-orange-500 to-yellow-600",
      nature: "from-jungle-dark via-green-600 to-jungle",
      objects: "from-purple-500 via-violet-500 to-purple-600",
      body: "from-pink-500 via-rose-500 to-pink-600",
      clothes: "from-indigo-500 via-blue-500 to-indigo-600",
      family: "from-sunshine-dark via-amber-500 to-yellow-500",
      feelings: "from-coral-red via-red-500 to-rose-600",
      colors: "from-playful-purple via-purple-500 to-violet-500",
      numbers: "from-sky via-blue-500 to-cyan-500",
    };
    return (
      jungleColors[category as keyof typeof jungleColors] ||
      "from-jungle via-green-500 to-emerald-600"
    );
  };

  const getJungleDifficultyTheme = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return {
          bg: "bg-gradient-to-r from-jungle-light to-jungle",
          icon: <Leaf className="w-4 h-4" />,
          text: "🌱 Jungle Sprout",
          color: "text-white",
          border: "border-jungle-light",
        };
      case "medium":
        return {
          bg: "bg-gradient-to-r from-sunshine to-bright-orange",
          icon: <Sun className="w-4 h-4" />,
          text: "🌟 Jungle Explorer",
          color: "text-white",
          border: "border-sunshine",
        };
      case "hard":
        return {
          bg: "bg-gradient-to-r from-coral-red to-red-600",
          icon: <Mountain className="w-4 h-4" />,
          text: "🔥 Jungle Master",
          color: "text-white",
          border: "border-coral-red",
        };
      default:
        return {
          bg: "bg-gradient-to-r from-jungle to-jungle-dark",
          icon: <TreePine className="w-4 h-4" />,
          text: "🗺️ Explorer",
          color: "text-white",
          border: "border-jungle",
        };
    }
  };

  const difficultyTheme = getJungleDifficultyTheme(word.difficulty);

  return (
    <div
      className={cn(
        "relative w-full mx-auto",
        "max-w-[380px] sm:max-w-[340px] md:max-w-[360px] lg:max-w-[380px] xl:max-w-[400px]",
        "px-2 sm:px-0",
        "jungle-adventure-card-container",
        className,
      )}
    >
      {/* Very Light Jungle Adventure Particles Background */}
      {showJungleParticles && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-xl">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute text-xs opacity-10 animate-float-up", // Much smaller and more transparent
                `animation-delay-${(i * 600) % 1000}`,
              )}
              style={{
                left: `${Math.random() * 80 + 10}%`, // Keep particles more centered
                animationDuration: `${2 + Math.random() * 1}s`, // Faster animation
              }}
            >
              {["✨", "🌟"][i % 2]} {/* Only sparkles, no large emojis */}
            </div>
          ))}
        </div>
      )}

      {/* Level Up Celebration */}
      {isLevelingUp && (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold text-lg animate-bounce shadow-2xl border-2 border-yellow-300">
            <Crown className="w-6 h-6 inline mr-2" />
            Level Up! 🎉
          </div>
        </div>
      )}

      {/* 3D Jungle Adventure Card */}
      <div
        ref={cardRef}
        className={cn(
          "relative w-full transition-all duration-700 transform-gpu",
          "h-[360px] xs:h-[380px] sm:h-[360px] md:h-[380px] lg:h-[390px] xl:h-[400px]",
          "jungle-adventure-touch-target",
          "hover:scale-[1.02] transition-transform",
          "jungle-adventure-card-flip",
          isFlipped && "jungle-flipped",
          isPressed && "jungle-pressed",
        )}
        style={{
          willChange: "transform",
        }}
        onClick={handleFlip}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="button"
        tabIndex={0}
        aria-label={`Jungle Adventure Word Card for ${word.word}. ${isFlipped ? "Showing explorer details" : "Showing jungle word"}. Tap to explore!`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleFlip();
          }
        }}
      >
        {/* FRONT CARD - Jungle Adventure Design */}
        <Card
          className={cn(
            "absolute inset-0 w-full h-full backface-hidden",
            `bg-gradient-to-br ${getJungleCategoryColor(word.category)}`,
            "shadow-2xl hover:shadow-3xl rounded-xl overflow-hidden",
            "cursor-pointer transition-all duration-300",
            "jungle-adventure-front",
            !isFlipped && "z-10",
            "border-4 border-yellow-400/30",
          )}
        >
          <CardContent className="p-2 sm:p-3 md:p-3 lg:p-4 h-full flex flex-col text-white relative jungle-adventure-surface">
            {/* Jungle Adventure Header */}
            <div className="flex items-start justify-between mb-1 sm:mb-1 md:mb-1.5">
              <div className="flex flex-wrap gap-1 sm:gap-1.5 flex-1 pr-2">
                <Badge
                  className={cn(
                    difficultyTheme.bg,
                    difficultyTheme.color,
                    difficultyTheme.border,
                    "text-xs sm:text-sm font-bold px-2 py-1 sm:px-3 sm:py-1.5",
                    "border-2 shadow-lg min-h-[24px] sm:min-h-[28px]",
                    "jungle-adventure-badge flex-shrink-0",
                  )}
                >
                  {difficultyTheme.icon}
                  <span className="ml-1 truncate">{difficultyTheme.text}</span>
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-white/20 border-white/40 text-white text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5 backdrop-blur-md min-h-[24px] sm:min-h-[28px] flex-shrink-0"
                >
                  🌿 <span className="truncate">{word.category}</span>
                </Badge>
              </div>

              {/* Adventure Level Indicator */}
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md rounded-full px-2 py-1 border border-white/30 flex-shrink-0 min-h-[24px] sm:min-h-[28px]">
                <Trophy className="w-3 h-3 text-yellow-300" />
                <span className="text-xs font-bold">Lv.{adventureLevel}</span>
              </div>
            </div>

            {/* Jungle Adventure Emoji Circle */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative mb-2 sm:mb-3">
                <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-42 lg:h-42 xl:w-44 xl:h-44 rounded-full bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-lg shadow-2xl border-4 border-white/30 flex items-center justify-center relative overflow-hidden jungle-adventure-emoji-container">
                  {/* Jungle Decorative Elements */}
                  <div className="absolute top-3 left-3 w-3 h-3 bg-yellow-300/30 rounded-full animate-sparkle opacity-60"></div>
                  <div className="absolute bottom-4 right-4 w-2 h-2 bg-green-300/30 rounded-full animate-bounce delay-300 opacity-50"></div>
                  <div className="absolute top-1/2 right-3 w-2 h-2 bg-blue-300/30 rounded-full animate-ping delay-700 opacity-40"></div>

                  {/* Jungle Vine Border Effect */}
                  <div className="absolute inset-0 rounded-full border-2 border-green-400/40 animate-pulse"></div>
                  <div className="absolute inset-2 rounded-full border border-yellow-400/30 animate-pulse delay-500"></div>

                  {/* Main Emoji with Jungle Glow */}
                  <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl relative z-10 drop-shadow-2xl jungle-adventure-emoji animate-gentle-bounce filter-glow">
                    {word.emoji || "🌿"}
                  </span>

                  {/* Light Magical Sparkles */}
                  {showMagicalSparkles && (
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(2)].map((_, i) => (
                        <Sparkles
                          key={i}
                          className={cn(
                            "absolute w-2 h-2 text-yellow-300 animate-sparkle opacity-30",
                            i % 2 === 0 ? "text-green-300" : "text-yellow-300",
                          )}
                          style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${i * 300}ms`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Jungle Adventure Word Display */}
              <div className="text-center space-y-1 sm:space-y-2">
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-bold tracking-wide drop-shadow-2xl leading-tight jungle-adventure-word text-center">
                    {word.word}
                  </h2>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePronounce();
                    }}
                    disabled={isPlaying}
                    className={cn(
                      "h-12 w-12 sm:h-14 sm:w-14 rounded-full transition-all duration-300 flex-shrink-0",
                      "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400",
                      "border-2 sm:border-4 border-white/50 hover:border-white/70",
                      "text-white hover:scale-110 active:scale-95",
                      "shadow-2xl hover:shadow-3xl",
                      "jungle-adventure-pronounce-btn",
                      isPlaying &&
                        "animate-pulse scale-110 from-green-400 to-emerald-500",
                    )}
                    aria-label="Hear jungle word pronunciation"
                  >
                    <Volume2 className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-lg" />
                  </Button>
                </div>

                {word.pronunciation && (
                  <p className="text-lg sm:text-xl opacity-95 font-semibold leading-tight bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30">
                    🗣��� {word.pronunciation}
                  </p>
                )}
              </div>
            </div>

            {/* Jungle Adventure Flip Hint */}
            <div className="mt-1 text-center px-2 sm:px-3">
              <div className="bg-gradient-to-r from-white/15 to-white/10 backdrop-blur-md border border-white/30 rounded-full px-3 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 mx-auto max-w-[95%] sm:max-w-none animate-gentle-bounce shadow-lg">
                <p className="text-xs sm:text-sm lg:text-sm opacity-95 leading-tight font-bold jungle-adventure-hint text-center flex items-center justify-center gap-1">
                  <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin-slow flex-shrink-0" />
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis min-w-0 flex-1 lg:whitespace-normal lg:overflow-visible">
                    Explore the jungle secrets! 🌿✨
                  </span>
                </p>
              </div>
            </div>

            {/* Adventure Progress Bar */}
            {explorerXP > 0 && (
              <div className="absolute bottom-2 left-3 right-3">
                <div className="bg-black/30 backdrop-blur-sm rounded-full h-2 overflow-hidden border border-white/30">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000 rounded-full"
                    style={{
                      width: `${Math.min(((explorerXP % 200) / 200) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* BACK CARD - Jungle Explorer Details */}
        <Card
          className={cn(
            "absolute inset-0 w-full h-full",
            "bg-gradient-to-br from-slate-800 via-green-900 to-slate-900 rounded-xl overflow-hidden shadow-2xl",
            "border-4 border-green-400/30",
            "jungle-adventure-back",
            isFlipped && "z-10",
          )}
        >
          <CardContent className="p-2 sm:p-3 md:p-3 lg:p-4 h-full flex flex-col text-white relative overflow-hidden jungle-adventure-back-surface">
            {/* Jungle Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 text-6xl transform rotate-12">
                🌿
              </div>
              <div className="absolute top-10 right-5 text-4xl transform -rotate-12">
                🦋
              </div>
              <div className="absolute bottom-10 left-5 text-5xl transform rotate-45">
                🌺
              </div>
              <div className="absolute bottom-0 right-0 text-6xl transform -rotate-45">
                🌟
              </div>
            </div>

            {/* Scrollable Explorer Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden jungle-scrollbar scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-transparent relative z-10">
              {/* Explorer Header */}
              <div className="flex items-center justify-between gap-2 mb-2 px-2 py-1.5 bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-md rounded-lg border border-green-400/30">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-xl animate-gentle-bounce flex-shrink-0">
                    {word.emoji}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold jungle-adventure-back-title truncate">
                    {word.word}
                  </h3>
                  <Gem className="w-4 h-4 text-yellow-400 animate-sparkle" />
                </div>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFlip();
                  }}
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 border-2 border-green-300/50 text-white flex-shrink-0 shadow-lg"
                  aria-label="Return to jungle word"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {/* Explorer Content Sections */}
              <div className="space-y-2 px-2 pb-2">
                {/* Definition Section */}
                <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-md rounded-xl p-2.5 border-2 border-blue-400/30 jungle-content-section">
                  <h4 className="text-sm font-bold mb-2 text-cyan-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-sparkle" />
                    🧭 Discovery Meaning:
                  </h4>
                  <p className="text-sm leading-relaxed jungle-adventure-text break-words">
                    {word.definition}
                  </p>
                </div>

                {/* Example Section */}
                {word.example && (
                  <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-md rounded-xl p-2.5 border-2 border-green-400/30 jungle-content-section">
                    <h4 className="text-sm font-bold mb-2 text-green-300 flex items-center gap-2">
                      <TreePine className="w-4 h-4 animate-sway" />
                      🌿 Jungle Example:
                    </h4>
                    <p className="text-sm italic leading-relaxed jungle-adventure-text break-words">
                      "{word.example}"
                    </p>
                  </div>
                )}

                {/* Fun Fact Section */}
                {word.funFact && (
                  <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-xl p-2.5 border-2 border-purple-400/30 jungle-content-section">
                    <h4 className="text-sm font-bold mb-2 text-pink-300 flex items-center gap-2">
                      <Star className="w-4 h-4 animate-sparkle" />
                      🎈 Explorer Secret:
                    </h4>
                    <p className="text-sm leading-relaxed jungle-adventure-text break-words">
                      {word.funFact}
                    </p>
                  </div>
                )}

                {/* Jungle Adventure Rating System */}
                {showVocabularyBuilder && (
                  <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg rounded-xl p-2.5 border-3 border-yellow-400/40 jungle-rating-section">
                    <div className="text-center mb-3">
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 backdrop-blur-md rounded-full px-4 py-2 border-2 border-yellow-400/50">
                        <Crown className="w-5 h-5 text-yellow-300 animate-bounce" />
                        <h4 className="text-sm sm:text-base font-bold text-white">
                          Rate Your Adventure!
                        </h4>
                        <Crown className="w-5 h-5 text-yellow-300 animate-bounce animation-delay-300" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {/* Jungle Challenging */}
                      <div className="flex flex-col items-center space-y-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRating("hard");
                            if (navigator.vibrate) {
                              navigator.vibrate([100, 50, 100]);
                            }
                          }}
                          className={cn(
                            "w-full h-10 sm:h-12 md:h-10 lg:h-10 bg-gradient-to-b from-red-500/40 to-red-700/40 hover:from-red-500/60 hover:to-red-700/60 border-3 border-red-400/60 text-white font-bold transition-all duration-300 flex flex-col items-center justify-center gap-0.5 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 jungle-rating-btn",
                            ratedAs === "hard" &&
                              "ring-3 ring-red-300 scale-105 border-red-300",
                            showCelebration &&
                              ratedAs === "hard" &&
                              "jungle-celebration-glow",
                          )}
                          aria-label="Jungle was challenging - need more exploration"
                        >
                          <div className="flex items-center gap-1">
                            <Mountain className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="text-lg md:text-xl animate-bounce">
                              😰
                            </span>
                          </div>
                          <span className="text-xs font-bold">Tough Trek</span>
                        </Button>
                        <p className="text-xs text-white/80 text-center leading-tight hidden sm:block">
                          Need more exploring!
                        </p>
                      </div>

                      {/* Jungle Good */}
                      <div className="flex flex-col items-center space-y-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRating("medium");
                            if (navigator.vibrate) {
                              navigator.vibrate([60, 30, 60]);
                            }
                          }}
                          className={cn(
                            "w-full h-10 sm:h-12 md:h-10 lg:h-10 bg-gradient-to-b from-yellow-500/40 to-orange-600/40 hover:from-yellow-500/60 hover:to-orange-600/60 border-3 border-yellow-400/60 text-white font-bold transition-all duration-300 flex flex-col items-center justify-center gap-0.5 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 jungle-rating-btn",
                            ratedAs === "medium" &&
                              "ring-3 ring-yellow-300 scale-105 border-yellow-300",
                            showCelebration &&
                              ratedAs === "medium" &&
                              "jungle-celebration-glow",
                          )}
                          aria-label="Good jungle exploration - getting there"
                        >
                          <div className="flex items-center gap-1">
                            <Sun className="w-3 h-3 md:w-4 md:h-4 animate-pulse" />
                            <span className="text-lg md:text-xl animate-gentle-bounce">
                              🤔
                            </span>
                          </div>
                          <span className="text-xs font-bold">Good Path</span>
                        </Button>
                        <p className="text-xs text-white/80 text-center leading-tight hidden sm:block">
                          On the right trail!
                        </p>
                      </div>

                      {/* Jungle Master */}
                      <div className="flex flex-col items-center space-y-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRating("easy");
                            if (navigator.vibrate) {
                              navigator.vibrate([30, 10, 30, 10, 30]);
                            }
                          }}
                          className={cn(
                            "w-full h-10 sm:h-12 md:h-10 lg:h-10 bg-gradient-to-b from-green-500/40 to-emerald-700/40 hover:from-green-500/60 hover:to-emerald-700/60 border-3 border-green-400/60 text-white font-bold transition-all duration-300 flex flex-col items-center justify-center gap-0.5 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 jungle-rating-btn",
                            ratedAs === "easy" &&
                              "ring-3 ring-green-300 scale-105 border-green-300",
                            showCelebration &&
                              ratedAs === "easy" &&
                              "ring-2 ring-green-300/50 animate-pulse",
                          )}
                          aria-label="Mastered jungle word - expert explorer"
                        >
                          <div className="flex items-center gap-1">
                            <Crown className="w-3 h-3 md:w-4 md:h-4 animate-sparkle" />
                            <span className="text-lg md:text-xl animate-celebration-sparkles">
                              🎉
                            </span>
                          </div>
                          <span className="text-xs font-bold">Explorer!</span>
                        </Button>
                        <p className="text-xs text-white/80 text-center leading-tight hidden sm:block">
                          Jungle Master!
                        </p>
                      </div>
                    </div>

                    {/* Jungle Encouragement */}
                    <div className="mt-3 text-center">
                      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-full px-3 py-2 border-2 border-green-400/40">
                        <p className="text-xs text-white/95 flex items-center justify-center gap-2">
                          <Leaf className="w-3 h-3 animate-sway" />
                          Choose your jungle adventure level!
                          <Flower2 className="w-3 h-3 animate-sparkle" />
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Jungle Navigation Footer */}
            <div className="px-2 py-2 flex-shrink-0 text-center relative z-10">
              <div
                className="bg-gradient-to-r from-green-600/30 to-emerald-600/30 backdrop-blur-md border-2 border-green-400/50 rounded-xl px-3 py-2 mx-auto w-fit animate-gentle-bounce cursor-pointer hover:from-green-500/40 hover:to-emerald-500/40 transition-all duration-300 shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFlip();
                }}
                role="button"
                tabIndex={0}
                aria-label="Return to jungle word front"
              >
                <p className="text-sm text-white font-bold flex items-center justify-center gap-2">
                  <TreePine className="w-4 h-4 animate-sway" />
                  Back to Jungle Word
                  <RotateCcw className="w-4 h-4 animate-spin-slow" />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Screen Reader for Jungle Adventure */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {isFlipped
          ? `Exploring jungle details for ${word.word}`
          : `Jungle adventure word ${word.word}`}
        {isPlaying && ` Hearing jungle pronunciation of ${word.word}`}
        {explorerXP > 0 && ` Explorer XP: ${explorerXP}`}
      </div>
    </div>
  );
};
