import React from "react";
import { Button } from "../../ui/button";
import { Word, AccessibilitySettings } from "../types";
import { useWordCardState } from "../hooks/useWordCardState";
import { usePronunciation } from "../hooks/usePronunciation";
import { useCelebration } from "../hooks/useCelebration";
import { useHints } from "../hooks/useHints";
import { useProgressDispatch } from "../hooks/useProgressDispatch";

interface WordActionsProps {
  word: Word;
  accessibilitySettings: AccessibilitySettings;
  onPronounce?: (word: Word) => void;
  onWordMastered?: (wordId: number, rating: "easy" | "medium" | "hard") => void;
  onWordPracticeNeeded?: (wordId: number) => void;
}

export function WordActions({
  word,
  accessibilitySettings,
  onPronounce,
  onWordMastered,
  onWordPracticeNeeded,
}: WordActionsProps) {
  const { state } = useWordCardState();
  const { pronounce, isPlaying } = usePronunciation(word, accessibilitySettings, onPronounce);
  const { celebrateMastery } = useCelebration(word);
  const { requestHint } = useHints(word.id);
  const { addScore, dispatchPracticeNeeded } = useProgressDispatch(word.id);

  const handleSayIt = (e: React.MouseEvent) => {
    e.stopPropagation();
    pronounce();
  };

  const handleNeedPractice = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await requestHint();
    dispatchPracticeNeeded();
    onWordPracticeNeeded?.(word.id);
    
    if (navigator.vibrate) {
      navigator.vibrate(40);
    }
  };

  const handleMasterIt = (e: React.MouseEvent) => {
    e.stopPropagation();
    addScore(25, "mastery");
    celebrateMastery("easy");
    onWordMastered?.(word.id, "easy");
    
    if (navigator.vibrate) {
      navigator.vibrate([30, 10, 30, 10, 30]);
    }
  };

  const canPronounce = !isPlaying && (state.mode === "learn" || state.quizRevealed);

  return (
    <div className="absolute bottom-2 left-2 right-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
      {/* Say It Button */}
      <Button
        onClick={handleSayIt}
        disabled={!canPronounce}
        className={`
          min-h-[44px] w-full rounded-xl transition-all duration-300
          bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600
          border-2 border-white/50 hover:border-white/70
          text-white hover:scale-[1.02] active:scale-[0.98] shadow-xl
          jungle-adventure-pronounce-btn
          ${isPlaying ? "animate-pulse from-green-400 to-emerald-500" : ""}
        `}
        size={accessibilitySettings.largeText ? "lg" : "sm"}
        aria-label="Say It! Hear jungle word pronunciation"
      >
        <span className="w-4 h-4 mr-2">🔊</span>
        <span>Say It</span>
      </Button>

      {/* Need Practice Button */}
      <Button
        onClick={handleNeedPractice}
        className={`
          min-h-[44px] w-full rounded-xl shadow-lg flex items-center gap-2
          bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white
        `}
        size={accessibilitySettings.largeText ? "lg" : "sm"}
        aria-label="Need Practice and get hint"
      >
        <span className="w-4 h-4">🎯</span>
        <span>Practice</span>
      </Button>

      {/* Master It Button */}
      <Button
        onClick={handleMasterIt}
        className={`
          min-h-[44px] w-full rounded-xl shadow-lg flex items-center gap-2
          bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white
          hover:scale-[1.02] active:scale-[0.98]
        `}
        size={accessibilitySettings.largeText ? "lg" : "sm"}
        aria-label="Master this word - I know it well!"
      >
        <span className="w-4 h-4">👑</span>
        <span>Master It</span>
      </Button>
    </div>
  );
}

