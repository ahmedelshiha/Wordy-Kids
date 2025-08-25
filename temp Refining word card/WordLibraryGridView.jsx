// Grid view component for word display
import React from 'react';
import { JungleWordCard } from './JungleWordCard';

export const WordLibraryGridView = ({
  words,
  onWordMastery,
  onWordFavorite,
  onWordShare,
  isWordMastered,
  isWordFavorited,
  accessibilitySettings,
  isMobile
}) => {
  return (
    <div className={`grid gap-6 ${
      isMobile ? 'grid-cols-1' : 
      accessibilitySettings.largeText ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 
      'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
    }`}>
      {words.map((word) => (
        <JungleWordCard
          key={word.id}
          word={word}
          isWordMastered={isWordMastered}
          isWordFavorited={isWordFavorited}
          onWordMastery={onWordMastery}
          onWordFavorite={onWordFavorite}
          onWordShare={onWordShare}
          accessibilitySettings={accessibilitySettings}
          showAnimations={!accessibilitySettings.reducedMotion}
          autoPlay={accessibilitySettings.autoPlay}
          className={accessibilitySettings.reducedMotion ? '' : 'animate-fade-in'}
        />
      ))}
    </div>
  );
};

