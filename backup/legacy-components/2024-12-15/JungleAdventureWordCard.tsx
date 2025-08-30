import React from "react";
import JungleWordLibraryCard from "./word-card/JungleWordLibraryCard";
import { WordCardProps } from "./word-card/types";

// Legacy interface for backward compatibility
interface JungleAdventureWordCardProps extends Omit<WordCardProps, 'onWordFavorite'> {
  // Remove favorite-related props that are no longer supported
  onWordFavorite?: (wordId: number) => void; // Deprecated - will be ignored
  isWordFavorited?: (wordId: number) => boolean; // Deprecated - will be ignored
}

/**
 * JungleAdventureWordCard - Legacy wrapper component
 * 
 * This component maintains backward compatibility while using the new
 * modular JungleWordLibraryCard implementation underneath.
 * 
 * @deprecated Consider migrating to JungleWordLibraryCard directly
 */
export const JungleAdventureWordCard: React.FC<JungleAdventureWordCardProps> = ({
  onWordFavorite, // Ignored - favorites feature removed
  isWordFavorited, // Ignored - favorites feature removed
  ...props
}) => {
  // Log deprecation warning for favorite-related props
  if (onWordFavorite || isWordFavorited) {
    console.warn(
      "JungleAdventureWordCard: Favorite functionality has been removed. " +
      "onWordFavorite and isWordFavorited props are ignored. " +
      "Consider migrating to JungleWordLibraryCard."
    );
  }

  return <JungleWordLibraryCard {...props} />;
};

export default JungleAdventureWordCard;

