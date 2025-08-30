import React from "react";
import JungleWordLibraryCard from "./word-card/JungleWordLibraryCard";
import type { WordCardProps } from "./word-card/types";

interface JungleAdventureWordCardProps
  extends Omit<WordCardProps, "onWordFavorite"> {
  onWordFavorite?: (wordId: number) => void;
  isWordFavorited?: (wordId: number) => boolean;
}

export const JungleAdventureWordCard: React.FC<
  JungleAdventureWordCardProps
> = ({ onWordFavorite, isWordFavorited, ...props }) => {
  if (onWordFavorite || isWordFavorited) {
    console.warn(
      "JungleAdventureWordCard: Favorite functionality has been removed. onWordFavorite and isWordFavorited props are ignored. Consider migrating to JungleWordLibraryCard.",
    );
  }

  return <JungleWordLibraryCard {...props} />;
};

export default JungleAdventureWordCard;
