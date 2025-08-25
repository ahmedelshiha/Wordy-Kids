// Carousel view component for word display
import React from 'react';
import { Button } from '@/components/ui/button';
import { JungleWordCard } from './JungleWordCard';
import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';

export const WordLibraryCarouselView = ({
  words,
  currentWordIndex,
  onWordNavigation,
  onWordMastery,
  onWordFavorite,
  onWordShare,
  isWordMastered,
  isWordFavorited,
  accessibilitySettings,
  isMobile
}) => {
  const currentWord = words[currentWordIndex];
  
  if (!currentWord) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-gray-600">No words found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Current word card */}
      <JungleWordCard
        word={currentWord}
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

      {/* Navigation controls */}
      <div className="flex items-center justify-between mt-8">
        <Button
          onClick={() => onWordNavigation('prev')}
          disabled={currentWordIndex === 0}
          className={`flex items-center gap-2 ${
            accessibilitySettings.largeText ? 'text-lg py-6 px-8' : ''
          }`}
          aria-label="Previous word"
        >
          <ChevronLeft className={`${accessibilitySettings.largeText ? 'w-6 h-6' : 'w-5 h-5'} mr-1`} />
          Previous
        </Button>

        <div className="flex items-center gap-4">
          <span className={`text-sm ${
            accessibilitySettings.highContrast ? 'text-white' : 'text-gray-600'
          }`}>
            {currentWordIndex + 1} of {words.length}
          </span>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onWordNavigation('random')}
            aria-label="Random word"
            className={accessibilitySettings.largeText ? 'text-base p-3' : ''}
          >
            <Shuffle className={`${accessibilitySettings.largeText ? 'w-5 h-5' : 'w-4 h-4'} mr-1`} />
            Random
          </Button>
        </div>

        <Button
          onClick={() => onWordNavigation('next')}
          disabled={currentWordIndex === words.length - 1}
          className={`flex items-center gap-2 ${
            accessibilitySettings.largeText ? 'text-lg py-6 px-8' : ''
          }`}
          aria-label="Next word"
        >
          Next
          <ChevronRight className={`${accessibilitySettings.largeText ? 'w-6 h-6' : 'w-5 h-5'} ml-1`} />
        </Button>
      </div>

      {/* Word progress indicator */}
      <div className="mt-6 bg-gray-200 h-1 rounded-full overflow-hidden">
        <div 
          className="bg-green-500 h-full transition-all duration-300"
          style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
        />
      </div>

      {/* Keyboard navigation hint */}
      {!isMobile && (
        <div className="text-center mt-4 text-xs text-gray-500">
          <p>Use arrow keys ← → to navigate between words</p>
        </div>
      )}
    </div>
  );
};

