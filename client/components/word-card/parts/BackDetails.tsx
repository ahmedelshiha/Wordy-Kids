import React from "react";
import { CardContent } from "../../ui/card";
import { Word } from "../types";
import { useWordCardState } from "../hooks/useWordCardState";
import { useHints } from "../hooks/useHints";

interface BackDetailsProps {
  word: Word;
  onFlip: () => void;
}

export function BackDetails({ word, onFlip }: BackDetailsProps) {
  const { state } = useWordCardState();
  const { showHint, hintText } = useHints(word.id);

  return (
    <CardContent className="p-2 sm:p-3 md:p-3 lg:p-4 h-full flex flex-col text-white relative jungle-adventure-surface overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/30 to-emerald-500/30 backdrop-blur-md rounded-full px-4 py-2 border-2 border-green-400/50">
          <span className="w-5 h-5 animate-bounce">🌿</span>
          <h3 className="text-lg sm:text-xl font-bold">Jungle Explorer Details</h3>
          <span className="w-5 h-5 animate-bounce animation-delay-300">✨</span>
        </div>
      </div>

      {/* Word Display */}
      <div className="text-center mb-4">
        <h2 className="text-3xl sm:text-4xl font-bold mb-2 break-words">
          {word.word}
        </h2>
        {word.pronunciation && (
          <p className="text-lg opacity-95 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30">
            🗣️ {word.pronunciation}
          </p>
        )}
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {/* Definition */}
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-lg rounded-xl p-3 border-2 border-green-400/40">
          <h4 className="text-sm sm:text-base font-bold mb-2 text-green-200 flex items-center gap-2">
            <span className="w-4 h-4">📚</span>
            What it means:
          </h4>
          <p className="text-sm leading-relaxed break-words">
            {word.definition}
          </p>
        </div>

        {/* Example */}
        {word.example && (
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-lg rounded-xl p-3 border-2 border-blue-400/40">
            <h4 className="text-sm sm:text-base font-bold mb-2 text-blue-200 flex items-center gap-2">
              <span className="w-4 h-4">💡</span>
              Example:
            </h4>
            <p className="text-sm leading-relaxed break-words italic">
              "{word.example}"
            </p>
          </div>
        )}

        {/* Fun Fact */}
        {word.funFact && (
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-xl p-3 border-2 border-purple-400/40">
            <h4 className="text-sm sm:text-base font-bold mb-2 text-purple-200 flex items-center gap-2">
              <span className="w-4 h-4">🎈</span>
              Explorer Secret:
            </h4>
            <p className="text-sm leading-relaxed break-words">
              {word.funFact}
            </p>
          </div>
        )}

        {/* Hint Display */}
        {showHint && hintText && (
          <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg rounded-xl p-3 border-2 border-yellow-400/40">
            <h4 className="text-sm sm:text-base font-bold mb-2 text-yellow-200 flex items-center gap-2">
              <span className="w-4 h-4">💭</span>
              Helpful Hint:
            </h4>
            <p className="text-sm leading-relaxed break-words">
              {hintText}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="px-2 py-2 flex-shrink-0 text-center relative z-10 mt-4">
        <div
          className="bg-gradient-to-r from-green-600/30 to-emerald-600/30 backdrop-blur-md border-2 border-green-400/50 rounded-xl px-3 py-2 mx-auto w-fit animate-gentle-bounce cursor-pointer hover:from-green-500/40 hover:to-emerald-500/40 transition-all duration-300 shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            onFlip();
          }}
          role="button"
          tabIndex={0}
          aria-label="Return to jungle word front"
        >
          <p className="text-sm text-white font-bold flex items-center justify-center gap-2">
            <span className="w-4 h-4 animate-sway">🌲</span>
            Back to Jungle Word
            <span className="w-4 h-4 animate-spin-slow">🔄</span>
          </p>
        </div>
      </div>
    </CardContent>
  );
}

