import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Star } from "lucide-react";
import { WordCardProps } from "./types";
import { cn } from "@/lib/utils";
import { audioService } from "@/lib/audioService";

export default function JungleWordLibraryCard({
  word,
  onPronounce,
  onWordMastered,
  className = "",
  accessibilitySettings = {
    highContrast: true,
    largeText: true,
    reducedMotion: false,
    autoPlay: true,
    soundEnabled: true,
  },
  autoPlay = true,
}: WordCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [announce, setAnnounce] = useState("");
  const reducedMotion = accessibilitySettings?.reducedMotion ?? false;
  const soundEnabled = accessibilitySettings?.soundEnabled ?? true;

  // Autoplay pronunciation when card appears
  useEffect(() => {
    if (!autoPlay || !soundEnabled) return;
    const t = setTimeout(() => pronounce(), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word?.id]);

  const triggerHaptic = (pattern: number | number[] = [35, 20, 35]) => {
    try {
      if (typeof navigator !== "undefined" && (navigator as any).vibrate) {
        (navigator as any).vibrate(pattern);
      }
    } catch {}
  };

  const triggerBounce = () => {
    setBounce(false);
    // next tick reflow to restart animation
    requestAnimationFrame(() => setBounce(true));
    setTimeout(() => setBounce(false), 650);
  };

  const gentleConfetti = () => {
    if (!reducedMotion) setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1200);
  };

  const pronounce = async () => {
    triggerHaptic();
    triggerBounce();
    if (!soundEnabled) return;
    try {
      setIsPlaying(true);
      await audioService.pronounceWord(word.word, {
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
      onPronounce?.(word);
      setAnnounce(`Saying ${word.word}`);
    } catch {
      setIsPlaying(false);
    }
  };

  const handleMastered = () => {
    triggerHaptic([30, 40, 30]);
    gentleConfetti();
    try {
      audioService.playSuccessSound?.();
    } catch {}
    onWordMastered?.(word.id, "easy");
    setAnnounce(`${word.word} marked as mastered`);
  };

  // Confetti pieces (emoji-based, lightweight)
  const confetti = useMemo(() => {
    const items = ["✨", "🎉", "⭐", "🌟", "💫", "🎈"];
    return new Array(14).fill(0).map((_, i) => ({
      id: i,
      emoji: items[i % items.length],
      left: Math.random() * 90 + 5,
      delay: Math.random() * 200,
    }));
  }, [word.id]);

  return (
    <div
      role="group"
      aria-label={`Word card for ${word.word}`}
      className={cn(
        "relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-lg border-2",
        accessibilitySettings?.highContrast
          ? "border-white/70"
          : "border-white/40",
        "bg-gradient-to-br from-green-100 via-sky-100 to-yellow-100",
        "jungle-adventure-surface",
        className,
      )}
    >
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-6 -left-6 text-5xl opacity-15 select-none">
          🌿
        </div>
        <div className="absolute -bottom-6 -right-6 text-5xl opacity-15 select-none">
          🦋
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        {/* Giant Emoji/Image */}
        <button
          type="button"
          onClick={pronounce}
          aria-label={`Pronounce ${word.word}`}
          className={cn(
            "outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full",
            "select-none",
          )}
        >
          <div
            className={cn(
              "text-7xl sm:text-8xl md:text-9xl",
              !reducedMotion && bounce && "animate-emoji-bounce",
            )}
          >
            {word.emoji || "📝"}
          </div>
        </button>

        {/* Word Text */}
        <h2
          className={cn(
            "text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-wide text-center",
            accessibilitySettings?.highContrast && "drop-shadow",
          )}
        >
          {word.word}
        </h2>
        {word.pronunciation && (
          <p className="text-base sm:text-lg text-gray-700 font-semibold bg-white/60 rounded-full px-3 py-1 border border-white/70">
            🗣️ {word.pronunciation}
          </p>
        )}

        {/* Actions */}
        <div className="mt-2 flex items-center justify-center gap-3 sm:gap-4">
          <Button
            onClick={pronounce}
            disabled={isPlaying}
            aria-label={`Pronounce ${word.word}`}
            className={cn(
              "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-full",
              "min-w-[75px] min-h-[75px] w-[80px] h-[80px] sm:w-[90px] sm:h-[90px]",
              "transition-transform hover:scale-105 active:scale-95",
            )}
          >
            <Volume2 className="w-5 h-5" />
          </Button>

          <Button
            onClick={handleMastered}
            aria-label={`Mark ${word.word} as mastered`}
            className={cn(
              "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white rounded-full",
              "min-w-[75px] min-h-[75px] w-[80px] h-[80px] sm:w-[90px] sm:h-[90px]",
              "transition-transform hover:scale-105 active:scale-95",
            )}
          >
            <Star className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Gentle Confetti */}
      {showConfetti && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {confetti.map((c) => (
            <span
              key={c.id}
              className={cn(
                "absolute text-xl select-none",
                !reducedMotion && "animate-jungle-sparkle",
              )}
              style={{
                left: `${c.left}%`,
                top: 0,
                animationDelay: `${c.delay}ms`,
              }}
            >
              {c.emoji}
            </span>
          ))}
        </div>
      )}

      {/* Screen reader live region */}
      <div aria-live="polite" className="sr-only">
        {announce}
      </div>
    </div>
  );
}
