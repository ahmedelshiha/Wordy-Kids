import React from "react";
import { Word, AccessibilitySettings } from "../types";
import { useWordCardState } from "../hooks/useWordCardState";

interface WordMediaProps {
  word: Word;
  accessibilitySettings: AccessibilitySettings;
}

export function WordMedia({ word, accessibilitySettings }: WordMediaProps) {
  const { state } = useWordCardState();

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="relative mb-2 sm:mb-3">
        <div
          className="rounded-full bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-lg shadow-2xl border-4 border-white/30 flex items-center justify-center relative overflow-hidden jungle-adventure-emoji-container mx-auto"
          style={{
            height: "40%",
            width: "40%",
            minWidth: "96px",
            minHeight: "96px",
            maxWidth: "220px",
            maxHeight: "220px",
          }}
        >
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
          {state.showParticles && (
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className={`
                    absolute w-2 h-2 animate-sparkle opacity-30
                    ${i % 2 === 0 ? "text-green-300" : "text-yellow-300"}
                  `}
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${i * 300}ms`,
                  }}
                >
                  ✨
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

