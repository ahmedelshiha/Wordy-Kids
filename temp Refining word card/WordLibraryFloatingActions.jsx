// Floating action buttons component
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  Shuffle, 
  Brain,
  ArrowUp,
  Volume2,
  VolumeX
} from 'lucide-react';

export const WordLibraryFloatingActions = ({
  onToggleFilters,
  onRandomWord,
  onVocabularyBuilder,
  onScrollToTop,
  onToggleSound,
  accessibilitySettings,
  showScrollToTop = false,
  isMobile = false
}) => {
  if (!isMobile) {
    // Desktop version - horizontal button bar
    return (
      <div className="fixed bottom-6 right-6 z-30">
        <div className={`flex items-center gap-2 p-2 rounded-full shadow-lg ${
          accessibilitySettings.highContrast ? 'bg-gray-900' : 'bg-white/90 backdrop-blur-sm'
        }`}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFilters}
            className="w-10 h-10 rounded-full"
            aria-label="Toggle filters"
          >
            <Filter className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onRandomWord}
            className="w-10 h-10 rounded-full"
            aria-label="Random word"
          >
            <Shuffle className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onVocabularyBuilder}
            className="w-10 h-10 rounded-full"
            aria-label="Vocabulary builder"
          >
            <Brain className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSound}
            className="w-10 h-10 rounded-full"
            aria-label={accessibilitySettings.soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {accessibilitySettings.soundEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </Button>
          
          {showScrollToTop && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onScrollToTop}
              className="w-10 h-10 rounded-full"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Mobile version - stacked buttons
  return (
    <div className="fixed bottom-24 right-6 z-30 flex flex-col gap-3">
      {showScrollToTop && (
        <Button
          variant="default"
          size="icon"
          onClick={onScrollToTop}
          className="w-12 h-12 rounded-full shadow-lg bg-gray-700"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
      
      <Button
        variant="default"
        size="icon"
        onClick={onToggleFilters}
        className="w-12 h-12 rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-indigo-500"
        aria-label="Toggle filters"
      >
        <Filter className="w-5 h-5" />
      </Button>
      
      <Button
        variant="default"
        size="icon"
        onClick={onRandomWord}
        className="w-12 h-12 rounded-full shadow-lg bg-gradient-to-r from-orange-500 to-yellow-500"
        aria-label="Random word"
      >
        <Shuffle className="w-5 h-5" />
      </Button>
    </div>
  );
};

