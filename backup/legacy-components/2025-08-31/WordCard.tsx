import React from "react";
import { EnhancedWordCard } from "./EnhancedWordCard";

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

interface WordCardProps {
  word: Word;
  showDefinition?: boolean;
  onPronounce?: (word: Word) => void;
  onFavorite?: (word: Word) => void;
  onWordMastered?: (wordId: number, rating: "easy" | "medium" | "hard") => void;
  showVocabularyBuilder?: boolean;
  className?: string;
}

/**
 * Legacy WordCard component - backup copy.
 */
export const WordCard: React.FC<WordCardProps> = (props) => {
  return (
    <EnhancedWordCard
      {...props}
      enableSwipeGestures={true}
      showAccessibilityFeatures={true}
    />
  );
};
