import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useReward } from "@/contexts/RewardContext";
import { useMiniGames } from "@/hooks/useMiniGames";
import WordCardBack from "@/components/word-card/WordCardBack";
import {
  Volume2,
  RotateCcw,
  Heart,
  Star,
  Crown,
  Sparkles,
  ArrowLeft,
  Play,
  CheckCircle,
  Clock,
} from "lucide-react";

export interface Word {
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
}

interface WordCardUnifiedProps {
  word: Word;
  onSayIt?: (word: Word) => void;
  onPronounce?: (word: Word) => void;
  onNeedPractice?: (wordId: number) => void;
  onMasterIt?: (wordId: number) => void;
  onFavorite?: (wordId: number) => void;
  // Progress tracking
  currentStars?: number;
  maxStars?: number;
  hasHeardPronunciation?: boolean;
  hasFlipped?: boolean;
  masteryStatus?: "none" | "practice" | "mastered";
  isFavorited?: boolean;
  // Settings
  autoPronounce?: boolean;
  autoPlay?: boolean;
  reducedMotion?: boolean;
  showButtons?: boolean;
  ageGroup?: "3-5" | "6-8" | "9-12";
  // Accessibility
  accessibilitySettings?: {
    highContrast?: boolean;
    largeText?: boolean;
    reducedMotion?: boolean;
    autoPlay?: boolean;
    soundEnabled?: boolean;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const WordCardUnified: React.FC<WordCardUnifiedProps> = ({
  word,
  onSayIt,
  onPronounce,
  onNeedPractice,
  onMasterIt,
  onFavorite,
  currentStars = 0,
  maxStars = 3,
  hasHeardPronunciation = false,
  hasFlipped = false,
  masteryStatus = "none",
  isFavorited = false,
  autoPronounce = true,
  autoPlay = false,
  reducedMotion = false,
  showButtons = true,
  ageGroup = "6-8",
  accessibilitySettings = {},
  className,
  size = "md",
}) => {
  const { showReward } = useReward();
  const { startGame } = useMiniGames();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [interactionCount, setInteractionCount] = useState(
    hasHeardPronunciation ? 1 : 0,
  );
  const cardRef = useRef<HTMLDivElement>(null);
  const hasAutoPlayed = useRef(false);

  const {
    highContrast = false,
    largeText = false,
    reducedMotion: a11yReducedMotion = false,
    autoPlay: a11yAutoPlay = false,
    soundEnabled = true,
  } = accessibilitySettings;

  const effectiveReducedMotion = reducedMotion || a11yReducedMotion;
  const effectiveAutoPlay = autoPlay || a11yAutoPlay;

  // Initialize flip state from prop
  useEffect(() => {
    if (hasFlipped) setIsFlipped(true);
  }, [hasFlipped]);

  // Auto-pronounce on mount for young children
  useEffect(() => {
    const shouldAutoPlay =
      (ageGroup === "3-5" || effectiveAutoPlay || autoPronounce) &&
      soundEnabled &&
      !hasAutoPlayed.current;

    if (shouldAutoPlay) {
      hasAutoPlayed.current = true;
      // Small delay to let card appear first
      setTimeout(() => {
        handleSayIt();
      }, 500);
    }
  }, [ageGroup, effectiveAutoPlay, autoPronounce, soundEnabled]);

  // Announce for screen readers via ARIA live region (no TTS to avoid interruptions)
  useEffect(() => {
    if (isFlipped) return;
    try {
      let live = document.getElementById("jungle-live-region");
      if (!live) {
        live = document.createElement("div");
        live.id = "jungle-live-region";
        live.setAttribute("aria-live", "polite");
        live.setAttribute("aria-atomic", "true");
        live.className = "sr-only";
        document.body.appendChild(live);
      }
      live.textContent = `Word card: ${word.word}. Tap Say It, Practice, or Master It.`;
      const t = setTimeout(() => {
        if (live) live.textContent = "";
      }, 1200);
      return () => clearTimeout(t);
    } catch {}
  }, [word.word, isFlipped]);

  // Handle Say It action
  const handleSayIt = useCallback(async () => {
    if (isPlaying) return;

    setIsPlaying(true);
    setInteractionCount((prev) => prev + 1);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Show sparkles
    if (!effectiveReducedMotion) {
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 1500);
    }

    try {
      // Call parent handler(s)
      onSayIt?.(word);
      onPronounce?.(word);

      // Pronounce the word
      if (soundEnabled && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(word.word);
        utterance.rate = 0.7;
        utterance.volume = 0.8;
        utterance.pitch = 1.1;
        utterance.lang = "en-US";

        utterance.onend = () => {
          setIsPlaying(false);
        };

        utterance.onerror = () => {
          setIsPlaying(false);
        };

        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setIsPlaying(false), 1000);
      }

      // Show reward for first pronunciation
      if (interactionCount === 0) {
        showReward({
          title: "Great Job! 🎉",
          message: `You said "${word.word}" perfectly!`,
          icon: "🔊",
          type: "word",
          gemsEarned: 1,
        });
      }
    } catch (error) {
      console.error("Error pronouncing word:", error);
      setIsPlaying(false);
    }
  }, [
    word,
    isPlaying,
    onSayIt,
    showReward,
    interactionCount,
    soundEnabled,
    effectiveReducedMotion,
  ]);

  // Handle Need Practice action
  const handleNeedPractice = useCallback(() => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    // UI click/cheer sound (respect soundEnabled)
    try {
      if (soundEnabled && typeof Audio !== "undefined") {
        const audio = new Audio("/sounds/ui/settings-saved.mp3");
        audio.volume = 0.4;
        audio.play().catch(() => {});
      }
    } catch {}

    onNeedPractice?.(word.id);

    // Show encouraging reward
    showReward({
      title: "That's Okay! 💡",
      message: `We'll practice "${word.word}" again later!`,
      icon: "🌱",
      type: "word",
    });

    setInteractionCount((prev) => prev + 1);
  }, [word.id, onNeedPractice, showReward, soundEnabled]);

  // Handle Master It action
  const handleMasterIt = useCallback(() => {
    // Haptic celebration
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }

    // Cheer sound (respect soundEnabled)
    try {
      if (soundEnabled && typeof Audio !== "undefined") {
        const audio = new Audio("/sounds/ui/settings-saved.mp3");
        audio.volume = 0.5;
        audio.play().catch(() => {});
      }
    } catch {}

    // Trigger celebration
    if (!effectiveReducedMotion) {
      setCelebrationActive(true);
      setTimeout(() => setCelebrationActive(false), 2000);
    }

    onMasterIt?.(word.id);

    // Show celebration reward
    showReward({
      title: "Word Mastered! 🌟",
      message: `Amazing! You mastered "${word.word}"!`,
      icon: "✅",
      type: "word",
      gemsEarned: 5,
    });

    setInteractionCount((prev) => prev + 1);
  }, [word.id, onMasterIt, showReward, effectiveReducedMotion, soundEnabled]);

  // Handle favorite toggle
  const handleFavorite = useCallback(() => {
    onFavorite?.(word.id);

    // Light haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    if (!isFavorited) {
      showReward({
        title: "Added to Favorites! ⭐",
        message: `"${word.word}" is now in your favorites!`,
        icon: "❤️",
        type: "word",
      });
    }
  }, [word.id, onFavorite, isFavorited, showReward]);

  // Handle card flip
  const handleFlip = useCallback(() => {
    setIsFlipped(!isFlipped);

    // Light haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(40);
    }
  }, [isFlipped]);

  // Get card size classes
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-60 h-72 sm:w-64 sm:h-80";
      case "lg":
        return "w-80 h-[26rem] sm:w-96 sm:h-[28rem]";
      default:
        return "w-72 h-80 sm:w-80 sm:h-96";
    }
  };

  // Get emoji size
  const getEmojiSize = () => {
    switch (size) {
      case "sm":
        return largeText ? "text-5xl sm:text-6xl" : "text-4xl sm:text-5xl";
      case "lg":
        return largeText ? "text-8xl sm:text-9xl" : "text-7xl sm:text-8xl";
      default:
        return largeText ? "text-6xl sm:text-8xl" : "text-5xl sm:text-7xl";
    }
  };

  // Get button size
  const getButtonSize = () => {
    if (ageGroup === "3-5" || largeText) return "lg";
    return size === "lg" ? "lg" : "default";
  };

  const difficultyColors = {
    easy: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    hard: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className={cn("relative perspective-1000", className)}>
      {/* Card Container */}
      <motion.div
        ref={cardRef}
        className={cn(
          "relative mx-auto duration-700 cursor-pointer",
          !effectiveReducedMotion && "preserve-3d",
          getSizeClasses(),
          !effectiveReducedMotion && isFlipped && "rotate-y-180",
        )}
        style={{
          transformStyle: effectiveReducedMotion ? undefined : "preserve-3d",
          transform: effectiveReducedMotion
            ? "none"
            : isFlipped
              ? "rotateY(180deg)"
              : "rotateY(0deg)",
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Front of Card */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full backface-hidden",
            "bg-gradient-to-br from-white to-blue-50",
            "rounded-3xl shadow-xl border-2 border-white/50",
            "flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden",
            "transform-gpu",
            highContrast && "border-4 border-gray-800 bg-white",
            masteryStatus === "mastered" &&
              "ring-4 ring-green-400 ring-offset-2",
            celebrationActive && !effectiveReducedMotion && "animate-bounce",
            isFlipped && "hidden",
          )}
          style={{ backfaceVisibility: "hidden" }}
          onClick={() => setIsFlipped(true)}
          role="button"
          aria-label={`Flip to see definition for ${word.word}`}
        >
          {/* Header Badges */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="flex gap-2">
              <Badge
                className={cn("text-xs", difficultyColors[word.difficulty])}
              >
                {word.difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {word.category}
              </Badge>
            </div>

            <div className="flex gap-2">
              {/* Favorite button */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavorite();
                }}
                variant="ghost"
                size="sm"
                className={cn(
                  "w-8 h-8 p-0 rounded-full transition-colors",
                  isFavorited
                    ? "text-red-500 hover:text-red-600"
                    : "text-gray-400 hover:text-gray-600",
                )}
                aria-label={
                  isFavorited ? "Remove from favorites" : "Add to favorites"
                }
              >
                <Heart
                  className={cn("w-4 h-4", isFavorited && "fill-current")}
                />
              </Button>
            </div>
          </div>

          {/* Progress Stars */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-1">
              {Array.from({ length: maxStars }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: i < currentStars ? 1 : 0.5 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Star
                    className={cn(
                      "w-4 h-4",
                      i < currentStars
                        ? "text-yellow-500 fill-current"
                        : "text-gray-300",
                    )}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sparkles overlay */}
          <AnimatePresence>
            {showSparkles && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      opacity: 0,
                      scale: 0,
                      x: "50%",
                      y: "50%",
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                      x: `${20 + Math.random() * 60}%`,
                      y: `${20 + Math.random() * 60}%`,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.1,
                      ease: "easeOut",
                    }}
                    className="absolute text-yellow-400 text-2xl"
                  >
                    ✨
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Word Display */}
          <div className="text-center mb-6 flex-1 flex flex-col justify-center">
            {/* Emoji */}
            <motion.div
              animate={
                !effectiveReducedMotion && isPlaying
                  ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
                  : {}
              }
              transition={{ duration: 0.6, repeat: isPlaying ? 3 : 0 }}
              className={cn("mb-4", getEmojiSize())}
              role="img"
              aria-label={`${word.word} emoji`}
            >
              {word.emoji || "📝"}
            </motion.div>

            {/* Word Text */}
            <h2
              className={cn(
                "font-bold text-gray-800 mb-2 leading-tight",
                largeText ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl",
                highContrast && "text-black",
              )}
            >
              {word.word}
            </h2>

            {/* Pronunciation */}
            {word.pronunciation && (
              <p
                className={cn(
                  "text-gray-500 mb-2",
                  largeText ? "text-base sm:text-lg" : "text-sm sm:text-base",
                  highContrast && "text-gray-800",
                )}
              >
                /{word.pronunciation}/
              </p>
            )}

            {/* Flip hint for older children */}
            {ageGroup !== "3-5" && (
              <button
                type="button"
                onClick={() => setIsFlipped(true)}
                className={cn(
                  "text-sm text-blue-600 hover:text-blue-800 transition-colors",
                  "border border-blue-200 rounded-full px-3 py-1 mt-2",
                  "focus:outline-none focus:ring-2 focus:ring-blue-400",
                )}
                aria-label="Flip to see definition"
              >
                Tap to see meaning →
              </button>
            )}
          </div>

          {/* Action Buttons - Always Visible */}
          {showButtons && (
            <div className="w-full space-y-3">
              {/* Say It Button */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSayIt();
                }}
                disabled={isPlaying}
                size={getButtonSize()}
                className={cn(
                  "w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl",
                  "min-h-[48px] text-lg font-bold shadow-lg",
                  "transition-all duration-200 transform hover:scale-105 active:scale-95",
                  isPlaying && "animate-pulse",
                  highContrast && "border-2 border-blue-800",
                )}
                aria-label={`Pronounce ${word.word}`}
              >
                <Volume2 className="w-5 h-5 mr-2" />
                {isPlaying ? "Playing..." : "🔊 Say It"}
              </Button>

              {/* Need Practice and Master It Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNeedPractice();
                  }}
                  size={getButtonSize()}
                  className={cn(
                    "flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-2xl",
                    "min-h-[48px] font-bold shadow-lg",
                    "transition-all duration-200 transform hover:scale-105 active:scale-95",
                    highContrast && "border-2 border-yellow-800",
                  )}
                  aria-label={`Mark ${word.word} as needing practice`}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  🌱 Practice
                </Button>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMasterIt();
                  }}
                  size={getButtonSize()}
                  className={cn(
                    "flex-1 rounded-2xl min-h-[48px] font-bold shadow-lg",
                    "transition-all duration-200 transform hover:scale-105 active:scale-95",
                    masteryStatus === "mastered"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-green-500 hover:bg-green-600",
                    "text-white",
                    highContrast && "border-2 border-green-800",
                  )}
                  aria-label={
                    masteryStatus === "mastered"
                      ? `${word.word} already mastered`
                      : `Mark ${word.word} as mastered`
                  }
                >
                  {masteryStatus === "mastered" ? (
                    <>
                      <Crown className="w-4 h-4 mr-1" />
                      👑 Mastered!
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />✅ Master It
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Back of Card */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full backface-hidden",
            !effectiveReducedMotion && "rotate-y-180",
            "bg-gradient-to-br from-purple-50 to-blue-50",
            "rounded-3xl shadow-xl border-2 border-white/50",
            "p-4 sm:p-6 flex flex-col overflow-hidden",
            "transform-gpu",
            highContrast && "border-4 border-gray-800 bg-white",
            !isFlipped && "hidden",
          )}
          style={{
            backfaceVisibility: "hidden",
            transform:
              !effectiveReducedMotion && !isFlipped
                ? "rotateY(180deg)"
                : "none",
          }}
        >
          {/* Back Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={() => setIsFlipped(false)}
              variant="outline"
              size="sm"
              className="rounded-full"
              aria-label="Flip back to word"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            <div
              className={cn(
                "text-2xl font-bold text-gray-800",
                largeText && "text-3xl",
                highContrast && "text-black",
              )}
            >
              {word.word}
            </div>
          </div>

          {/* Replace with WordCardBack content */}
          <div className="flex-1 mb-2">
            <WordCardBack
              word={word.word}
              definition={word.definition}
              example={word.example}
              funFact={word.funFact}
              onSayIt={handleSayIt}
              onNeedPractice={handleNeedPractice}
              onMasterIt={handleMasterIt}
            />
          </div>

          {/* Mini-games CTA */}
          <div className="mt-2">
            <Button
              onClick={() =>
                startGame("sound-match", {
                  word,
                  difficulty: word.difficulty,
                  ageGroup,
                })
              }
              size={getButtonSize()}
              className={cn(
                "w-full bg-orange-500 hover:bg-orange-600 text-white rounded-2xl",
                "min-h-[48px] font-bold shadow-lg",
                highContrast && "border-2 border-orange-800",
              )}
              aria-label={`Play mini game for ${word.word}`}
            >
              <Play className="w-4 h-4 mr-2" />
              Play Game 🎮
            </Button>
          </div>

          {/* Back to Front Button */}
          <Button
            onClick={() => setIsFlipped(false)}
            size={getButtonSize()}
            className={cn(
              "w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl",
              "min-h-[48px] font-bold",
              highContrast && "border-2 border-purple-800",
            )}
            aria-label="Flip back to word"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            🔄 Back to Word
          </Button>
        </div>
      </motion.div>

      {/* Celebration particles */}
      <AnimatePresence>
        {celebrationActive && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  y: "100%",
                  x: `${Math.random() * 100}%`,
                  scale: 0,
                  rotate: 0,
                }}
                animate={{
                  opacity: 0,
                  y: "-100%",
                  scale: [0, 1, 0],
                  rotate: 360,
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 0.5,
                  ease: "easeOut",
                }}
                className="absolute text-2xl"
              >
                {["🎉", "✨", "🌟", "🎊", "💎"][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Mastery indicator */}
      {masteryStatus === "mastered" && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-lg z-10"
        >
          <Crown className="w-5 h-5" />
        </motion.div>
      )}
    </div>
  );
};

export default WordCardUnified;
