import React from "react";
import { Badge } from "../../ui/badge";
import { Word } from "../types";
import { getJungleDifficultyTheme, getRarityBadgeStyle, getDifficultyStars } from "../utils/wordCardTheme";

interface WordHeaderBadgesProps {
  word: Word;
  adventureLevel: number;
}

export function WordHeaderBadges({ word, adventureLevel }: WordHeaderBadgesProps) {
  const difficultyTheme = getJungleDifficultyTheme(word.difficulty);
  const starCount = getDifficultyStars(word.difficulty);

  const renderDifficultyStars = () => {
    return Array.from({ length: starCount }, (_, i) => (
      <span key={i} className="w-3 h-3 text-yellow-400">⭐</span>
    ));
  };

  return (
    <div className="flex items-start justify-between mb-1 sm:mb-1 md:mb-1.5">
      <div className="flex flex-wrap gap-1 sm:gap-1.5 flex-1 pr-2">
        {/* Difficulty Badge */}
        <Badge
          className={`
            ${difficultyTheme.bg} ${difficultyTheme.color} ${difficultyTheme.border}
            text-xs sm:text-sm font-bold px-2 py-1 sm:px-3 sm:py-1.5
            border-2 shadow-lg min-h-[24px] sm:min-h-[28px]
            jungle-adventure-badge flex-shrink-0
          `}
        >
          <span className="mr-1">{difficultyTheme.icon}</span>
          <span className="ml-1 truncate">{difficultyTheme.text}</span>
          <div className="ml-1 flex gap-0.5">
            {renderDifficultyStars()}
          </div>
        </Badge>

        {/* Rarity Badge */}
        {word.rarity && (
          <Badge
            className={`
              text-xs font-bold capitalize px-2 py-1 border-2 shadow-lg min-h-[24px]
              ${getRarityBadgeStyle(word.rarity)}
            `}
          >
            {word.rarity}
          </Badge>
        )}

        {/* Habitat/Category Badge */}
        <Badge
          variant="outline"
          className="bg-white/20 border-white/40 text-white text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5 backdrop-blur-md min-h-[24px] sm:min-h-[28px] flex-shrink-0"
        >
          🌿 <span className="truncate">{word.habitat || word.category}</span>
        </Badge>
      </div>

      {/* Adventure Level Indicator */}
      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md rounded-full px-2 py-1 border border-white/30 flex-shrink-0 min-h-[24px] sm:min-h-[28px]">
        <span className="w-3 h-3 text-yellow-300">🏆</span>
        <span className="text-xs font-bold">Lv.{adventureLevel}</span>
      </div>
    </div>
  );
}

