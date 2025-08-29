import React from "react";
import { Word, AccessibilitySettings } from "../types";
import { useWordCardState } from "../hooks/useWordCardState";

interface WordTitlePronounceProps {
  word: Word;
  accessibilitySettings: AccessibilitySettings;
}

export function WordTitlePronounce({ word, accessibilitySettings }: WordTitlePronounceProps) {
  const { state } = useWordCardState();

  const shouldShowWord = () => {
    if (state.mode === "learn") return true;
    if (state.mode === "quiz" || state.mode === "memory") {
      return state.quizRevealed;
    }
    return true;
  };

  return (
    <div className="text-center space-y-1 sm:space-y-2">
      <div className="flex items-center justify-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-bold tracking-wide drop-shadow-2xl leading-tight jungle-adventure-word text-center break-words whitespace-normal hyphens-auto">
          {shouldShowWord() ? word.word : "???"}
        </h2>
      </div>

      {word.pronunciation && shouldShowWord() && (
        <p className="text-lg sm:text-xl opacity-95 font-semibold leading-tight bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30">
          🗣️ {word.pronunciation}
        </p>
      )}
    </div>
  );
}

