// View switcher component
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Grid3X3, 
  List, 
  Columns, 
  LayoutGrid,
  BookOpen,
  Brain,
  Gamepad2
} from 'lucide-react';

export const WordLibraryViewSwitcher = ({
  viewMode,
  wordViewMode,
  onViewModeChange,
  onWordViewModeChange,
  accessibilitySettings,
  isMobile
}) => {
  // For desktop, show as a toolbar
  if (!isMobile) {
    return (
      <div className={`flex items-center gap-4 p-4 rounded-lg ${
        accessibilitySettings.highContrast ? 'bg-gray-900' : 'bg-white'
      } shadow-sm border mb-6`}>
        {/* View mode switcher */}
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${
            accessibilitySettings.highContrast ? 'text-white' : 'text-gray-700'
          }`}>
            View:
          </span>
          <div className="flex items-center">
            <Button
              variant={viewMode === 'categories' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('categories')}
              className="flex items-center gap-2 rounded-r-none"
              aria-label="Categories view"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Categories</span>
            </Button>
            <Button
              variant={viewMode === 'words' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('words')}
              className="flex items-center gap-2 rounded-none border-l-0 border-r-0"
              aria-label="Words view"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Words</span>
            </Button>
            <Button
              variant={viewMode === 'vocabulary' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('vocabulary')}
              className="flex items-center gap-2 rounded-none border-r-0"
              aria-label="Vocabulary builder"
            >
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Practice</span>
            </Button>
            <Button
              variant={viewMode === 'minigame' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('minigame')}
              className="flex items-center gap-2 rounded-l-none"
              aria-label="Mini-games"
            >
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden sm:inline">Games</span>
            </Button>
          </div>
        </div>

        {/* Word view mode switcher (only shown when in words view) */}
        {viewMode === 'words' && (
          <div className="flex items-center gap-2 ml-auto">
            <span className={`text-sm font-medium ${
              accessibilitySettings.highContrast ? 'text-white' : 'text-gray-700'
            }`}>
              Layout:
            </span>
            <div className="flex items-center">
              <Button
                variant={wordViewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onWordViewModeChange('grid')}
                className="flex items-center gap-2 rounded-r-none"
                aria-label="Grid view"
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
              <Button
                variant={wordViewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onWordViewModeChange('list')}
                className="flex items-center gap-2 rounded-none border-l-0 border-r-0"
                aria-label="List view"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </Button>
              <Button
                variant={wordViewMode === 'carousel' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onWordViewModeChange('carousel')}
                className="flex items-center gap-2 rounded-l-none"
                aria-label="Carousel view"
              >
                <Columns className="w-4 h-4" />
                <span className="hidden sm:inline">Cards</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // For mobile, show as floating buttons
  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-3">
      {/* Word view mode switcher (only shown when in words view) */}
      {viewMode === 'words' && (
        <Button
          variant="default"
          size="icon"
          onClick={() => {
            const nextMode = {
              grid: 'list',
              list: 'carousel',
              carousel: 'grid'
            }[wordViewMode];
            onWordViewModeChange(nextMode);
          }}
          className="w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-indigo-500"
          aria-label="Change view mode"
        >
          {wordViewMode === 'grid' ? (
            <Grid3X3 className="w-6 h-6" />
          ) : wordViewMode === 'list' ? (
            <List className="w-6 h-6" />
          ) : (
            <Columns className="w-6 h-6" />
          )}
        </Button>
      )}

      {/* View mode switcher */}
      <Button
        variant="default"
        size="icon"
        onClick={() => {
          const nextMode = {
            categories: 'words',
            words: 'vocabulary',
            vocabulary: 'minigame',
            minigame: 'categories'
          }[viewMode];
          onViewModeChange(nextMode);
        }}
        className="w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-green-500 to-emerald-500"
        aria-label="Change main view"
      >
        {viewMode === 'categories' ? (
          <BookOpen className="w-6 h-6" />
        ) : viewMode === 'words' ? (
          <LayoutGrid className="w-6 h-6" />
        ) : viewMode === 'vocabulary' ? (
          <Brain className="w-6 h-6" />
        ) : (
          <Gamepad2 className="w-6 h-6" />
        )}
      </Button>
    </div>
  );
};

