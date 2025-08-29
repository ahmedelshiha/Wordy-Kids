import React, { useEffect } from "react";
import { CardContent } from "../ui/card";
import { WordCardProvider } from "./context/WordCardContext";
import { useWordCardState } from "./hooks/useWordCardState";
import { usePronunciation } from "./hooks/usePronunciation";
import { WordCardProps } from "./types";
import { getCardBackgroundGradient } from "./utils/wordCardTheme";

// Import all parts
import { WordCardShell } from "./parts/WordCardShell";
import { WordHeaderBadges } from "./parts/WordHeaderBadges";
import { WordStatusBadges } from "./parts/WordStatusBadges";
import { WordMedia } from "./parts/WordMedia";
import { WordTitlePronounce } from "./parts/WordTitlePronounce";
import { WordActions } from "./parts/WordActions";
import { WordProgressBar } from "./parts/WordProgressBar";
import { ParticlesOverlay } from "./parts/ParticlesOverlay";
import { ModeSelector } from "./parts/ModeSelector";
import { BackDetails } from "./parts/BackDetails";
import { AccessibilityAnnouncer } from "./parts/AccessibilityAnnouncer";

function JungleWordLibraryCardInner({
  word,
  showDefinition = false,
  onPronounce,
  onWordMastered,
  onWordPracticeNeeded,
  onWordShare,
  showVocabularyBuilder = false,
  className = "",
  adventureLevel = 1,
  explorerBadges = [],
  isJungleQuest = false,
  isWordMastered,
  accessibilitySettings = {
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    autoPlay: true,
    soundEnabled: true,
  },
  showAnimations = true,
  autoPlay = false,
}: WordCardProps) {
  const { state, actions } = useWordCardState();
  const { pronounce } = usePronunciation(word, accessibilitySettings, onPronounce);

  const isMastered = isWordMastered?.(word.id) || false;

  // Initialize state based on props
  useEffect(() => {
    if (showDefinition !== state.isFlipped) {
      actions.flipCard();
    }
  }, [showDefinition, state.isFlipped, actions]);

  // Auto-play pronunciation when card appears
  useEffect(() => {
    if (autoPlay && accessibilitySettings.soundEnabled) {
      const timer = setTimeout(() => {
        pronounce();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [word.id, autoPlay, accessibilitySettings.soundEnabled, pronounce]);

  // Handle card flip with enhanced interactions
  const handleFlip = () => {
    // Auto-pronounce on tap if not flipped
    if (!state.isFlipped) {
      pronounce();
    }

    // Scoring for taps + quiz reveal
    actions.addScore(5, "tap");
    if ((state.mode === "quiz" || state.mode === "memory") && !state.quizRevealed) {
      actions.setQuizRevealed(true);
      actions.addScore(10, "quiz_reveal");
    }

    actions.flipCard();

    // Enhanced haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([50, 20, 50, 20, 50]);
    }

    actions.setPressed(true);
    setTimeout(() => actions.setPressed(false), 300);
  };

  // Touch handlers for mobile
  const handleTouchStart = () => {
    actions.setPressed(true);
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const handleTouchEnd = () => {
    setTimeout(() => actions.setPressed(false), 100);
  };

  const cardBackgroundGradient = getCardBackgroundGradient(word);

  // Front card content
  const frontContent = (
    <CardContent className={`p-2 sm:p-3 md:p-3 lg:p-4 h-full flex flex-col text-white relative jungle-adventure-surface ${cardBackgroundGradient}`}>
      <WordHeaderBadges word={word} adventureLevel={adventureLevel} />
      <WordStatusBadges isMastered={isMastered} />
      <WordMedia word={word} accessibilitySettings={accessibilitySettings} />
      <WordTitlePronounce word={word} accessibilitySettings={accessibilitySettings} />
      
      {/* Jungle Adventure Flip Hint */}
      <div className="mt-1 text-center px-2 sm:px-3">
        <div className="bg-gradient-to-r from-white/15 to-white/10 backdrop-blur-md border border-white/30 rounded-full px-3 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 mx-auto max-w-[95%] sm:max-w-none animate-gentle-bounce shadow-lg">
          <p className="text-xs sm:text-sm lg:text-sm opacity-95 leading-tight font-bold jungle-adventure-hint text-center flex items-center justify-center gap-1">
            <span className="w-3 h-3 sm:w-4 sm:h-4 animate-spin-slow flex-shrink-0">🔄</span>
            <span className="whitespace-nowrap overflow-hidden text-ellipsis min-w-0 flex-1 lg:whitespace-normal lg:overflow-visible">
              Explore the jungle secrets! 🌿✨
            </span>
          </p>
        </div>
      </div>

      <WordActions
        word={word}
        accessibilitySettings={accessibilitySettings}
        onPronounce={onPronounce}
        onWordMastered={onWordMastered}
        onWordPracticeNeeded={onWordPracticeNeeded}
      />
    </CardContent>
  );

  // Back card content
  const backContent = (
    <BackDetails word={word} onFlip={handleFlip} />
  );

  const ariaLabel = `Jungle Adventure Word Card for ${word.word}. ${state.isFlipped ? "Showing explorer details" : "Showing jungle word"}. Tap to explore!`;

  return (
    <div className={`relative ${className}`}>
      <ParticlesOverlay accessibilitySettings={accessibilitySettings} />
      <WordProgressBar />
      <ModeSelector />
      
      <WordCardShell
        frontContent={frontContent}
        backContent={backContent}
        accessibilitySettings={accessibilitySettings}
        onFlip={handleFlip}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        ariaLabel={ariaLabel}
      />
      
      <AccessibilityAnnouncer word={word} />
    </div>
  );
}

export default function JungleWordLibraryCard(props: WordCardProps) {
  return (
    <WordCardProvider>
      <JungleWordLibraryCardInner {...props} />
    </WordCardProvider>
  );
}

