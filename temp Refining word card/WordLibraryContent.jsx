// Main content component for Word Library
import React from 'react';
import { WordLibraryCategoryView } from './WordLibraryCategoryView';
import { WordLibraryGridView } from './WordLibraryGridView';
import { WordLibraryListView } from './WordLibraryListView';
import { WordLibraryCarouselView } from './WordLibraryCarouselView';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, BookOpen } from 'lucide-react';

export const WordLibraryContent = ({
  viewMode,
  wordViewMode,
  selectedCategory,
  filteredWords,
  currentWordIndex,
  onCategorySelect,
  onWordNavigation,
  onWordMastery,
  onWordFavorite,
  onWordShare,
  onViewModeChange,
  isWordMastered,
  isWordFavorited,
  isCategoryUnlocked,
  accessibilitySettings,
  gameStats,
  isMobile
}) => {
  // No words found state
  const NoWordsFound = () => (
    <Card className={`max-w-2xl mx-auto ${
      accessibilitySettings.highContrast ? 'bg-black text-white border-white' : ''
    }`}>
      <CardContent className="p-8 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className={`font-bold mb-2 ${
          accessibilitySettings.largeText ? 'text-2xl' : 'text-xl'
        }`}>
          No jungle words found
        </h3>
        <p className={`text-gray-600 mb-6 ${
          accessibilitySettings.largeText ? 'text-lg' : 'text-base'
        } ${
          accessibilitySettings.highContrast ? 'text-gray-300' : ''
        }`}>
          Try adjusting your search or filters to discover more amazing words!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => onViewModeChange('categories')}
            className="flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Explore Categories
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Loading state
  const LoadingState = () => (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🌿</div>
        <p className={`text-gray-600 ${
          accessibilitySettings.largeText ? 'text-lg' : 'text-base'
        }`}>
          Loading jungle words...
        </p>
      </div>
    </div>
  );

  // Render based on view mode
  switch (viewMode) {
    case 'categories':
      return (
        <WordLibraryCategoryView
          selectedCategory={selectedCategory}
          onCategorySelect={onCategorySelect}
          isCategoryUnlocked={isCategoryUnlocked}
          accessibilitySettings={accessibilitySettings}
          gameStats={gameStats}
          isMobile={isMobile}
        />
      );

    case 'vocabulary':
      // This would be the vocabulary builder component
      return (
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🎧</div>
            <h3 className="text-2xl font-bold mb-4">Vocabulary Builder</h3>
            <p className="text-gray-600 mb-6">
              Coming soon! Practice your jungle words with fun games and activities.
            </p>
            <Button onClick={() => onViewModeChange('words')}>
              Back to Word Library
            </Button>
          </CardContent>
        </Card>
      );

    case 'minigame':
      // This would be mini-games
      return (
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold mb-4">Jungle Word Games</h3>
            <p className="text-gray-600 mb-6">
              Coming soon! Play exciting word games in the jungle!
            </p>
            <Button onClick={() => onViewModeChange('words')}>
              Back to Word Library
            </Button>
          </CardContent>
        </Card>
      );

    case 'words':
      // No words case
      if (filteredWords.length === 0) {
        return <NoWordsFound />;
      }

      // Render based on word view mode
      switch (wordViewMode) {
        case 'grid':
          return (
            <WordLibraryGridView
              words={filteredWords}
              onWordMastery={onWordMastery}
              onWordFavorite={onWordFavorite}
              onWordShare={onWordShare}
              isWordMastered={isWordMastered}
              isWordFavorited={isWordFavorited}
              accessibilitySettings={accessibilitySettings}
              isMobile={isMobile}
            />
          );

        case 'list':
          return (
            <WordLibraryListView
              words={filteredWords}
              onWordMastery={onWordMastery}
              onWordFavorite={onWordFavorite}
              onWordShare={onWordShare}
              isWordMastered={isWordMastered}
              isWordFavorited={isWordFavorited}
              accessibilitySettings={accessibilitySettings}
              isMobile={isMobile}
            />
          );

        case 'carousel':
          return (
            <WordLibraryCarouselView
              words={filteredWords}
              currentWordIndex={currentWordIndex}
              onWordNavigation={onWordNavigation}
              onWordMastery={onWordMastery}
              onWordFavorite={onWordFavorite}
              onWordShare={onWordShare}
              isWordMastered={isWordMastered}
              isWordFavorited={isWordFavorited}
              accessibilitySettings={accessibilitySettings}
              isMobile={isMobile}
            />
          );

        default:
          return <LoadingState />;
      }

    default:
      return <LoadingState />;
  }
};

