import { EnhancedMobileWordCard } from "./EnhancedMobileWordCard";

// Reuse the Word type from the demo database to ensure compatibility
import type { Word } from "@/data/wordsDatabase";

export interface EnhancedWordCardProps {
  word: Word;
  showDefinition?: boolean;
  onPronounce?: (word: Word) => void;
  onFavorite?: (word: Word) => void;
  onWordMastered?: (wordId: number, rating: "easy" | "medium" | "hard") => void;
  showVocabularyBuilder?: boolean;
  className?: string;
  // Compatibility flags expected by existing usages
  enableSwipeGestures?: boolean;
  showAccessibilityFeatures?: boolean;
  // Optional fullscreen controls (forwarded to mobile card)
  fullscreenMode?: boolean;
  onFullscreenToggle?: () => void;
}

export const EnhancedWordCard: React.FC<EnhancedWordCardProps> = ({
  enableSwipeGestures = true,
  showAccessibilityFeatures = false,
  ...rest
}) => {
  return (
    <EnhancedMobileWordCard
      {...rest}
      enableGestures={enableSwipeGestures}
      accessibilityMode={showAccessibilityFeatures}
    />
  );
};

export default EnhancedWordCard;
