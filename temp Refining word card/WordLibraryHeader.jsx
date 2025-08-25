// Header component for Jungle Word Adventure
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  Settings, 
  Trophy, 
  Gem, 
  Star,
  Volume2,
  VolumeX,
  Accessibility
} from 'lucide-react';

export const WordLibraryHeader = ({ 
  onBack,
  viewMode,
  selectedCategory,
  gameStats,
  isMobile,
  accessibilitySettings,
  onToggleAccessibility,
  onToggleSound
}) => {
  const getViewTitle = () => {
    switch (viewMode) {
      case 'categories':
        return '🌿 Jungle Word Adventure 🦋';
      case 'vocabulary':
        return '🎧 Jungle Vocabulary Builder 🌳';
      case 'minigame':
        return '🎮 Jungle Word Games 🦜';
      case 'words':
        if (selectedCategory === 'all') {
          return '🌳 All Jungle Words 🦋';
        }
        return `🌿 ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Adventure`;
      default:
        return '🌿 Jungle Word Adventure 🦋';
    }
  };

  const getViewEmoji = () => {
    switch (viewMode) {
      case 'categories': return '🗺️';
      case 'vocabulary': return '🎧';
      case 'minigame': return '🎮';
      case 'words': return '📚';
      default: return '🌿';
    }
  };

  if (isMobile) {
    return (
      <div className={`sticky top-0 z-50 border-b ${
        accessibilitySettings.highContrast
          ? 'bg-black border-white text-white'
          : 'bg-white/90 backdrop-blur-md border-green-200'
      }`}>
        <div className="flex items-center justify-between p-4">
          {/* Left side - Back button and title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {onBack && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onBack}
                className="min-h-[44px] min-w-[44px] p-0 shrink-0"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}

            <div className="min-w-0 flex-1">
              <h1 className={`font-bold truncate ${
                accessibilitySettings.largeText ? 'text-xl' : 'text-lg'
              } ${
                accessibilitySettings.highContrast 
                  ? 'text-white' 
                  : 'bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent'
              }`}>
                {getViewTitle()}
              </h1>
            </div>
          </div>

          {/* Right side - Stats and controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Game stats */}
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">
                <Trophy className="w-3 h-3 mr-1" />
                {gameStats.score}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Gem className="w-3 h-3 mr-1" />
                {gameStats.jungleGems}
              </Badge>
            </div>

            {/* Sound toggle */}
            <Button
              size="sm"
              variant="outline"
              onClick={onToggleSound}
              className="min-h-[44px] min-w-[44px] p-0"
              aria-label={accessibilitySettings.soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            >
              {accessibilitySettings.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>

            {/* Accessibility toggle */}
            <Button
              size="sm"
              variant="outline"
              onClick={onToggleAccessibility}
              className="min-h-[44px] min-w-[44px] p-0"
              aria-label="Toggle accessibility settings"
            >
              <Accessibility className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress indicator for words view */}
        {viewMode === 'words' && (
          <div className="px-4 pb-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1">
                <span className="text-2xl">{getViewEmoji()}</span>
                <span>Exploring jungle words</span>
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Streak: {gameStats.streak}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop header
  return (
    <div className={`border-b ${
      accessibilitySettings.highContrast
        ? 'bg-black border-white text-white'
        : 'bg-white/95 backdrop-blur-sm border-green-200'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Navigation and title */}
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center gap-2"
                aria-label="Go back"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}

            <div>
              <h1 className={`font-bold ${
                accessibilitySettings.largeText ? 'text-3xl' : 'text-2xl'
              } ${
                accessibilitySettings.highContrast 
                  ? 'text-white' 
                  : 'bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent'
              }`}>
                {getViewTitle()}
              </h1>
              {viewMode === 'words' && (
                <p className="text-sm text-gray-600 mt-1">
                  Discover amazing words in the jungle! 🌿
                </p>
              )}
            </div>
          </div>

          {/* Right side - Stats and controls */}
          <div className="flex items-center gap-4">
            {/* Game statistics */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-2 rounded-full">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <span className="font-bold text-yellow-800">{gameStats.score}</span>
                <span className="text-xs text-yellow-600">points</span>
              </div>

              <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-green-100 px-3 py-2 rounded-full">
                <Gem className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-emerald-800">{gameStats.jungleGems}</span>
                <span className="text-xs text-emerald-600">gems</span>
              </div>

              <div className="flex items-center gap-2 bg-gradient-to-r from-red-100 to-orange-100 px-3 py-2 rounded-full">
                <Star className="w-5 h-5 text-red-600" />
                <span className="font-bold text-red-800">{gameStats.streak}</span>
                <span className="text-xs text-red-600">streak</span>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleSound}
                className="flex items-center gap-2"
                aria-label={accessibilitySettings.soundEnabled ? 'Mute sounds' : 'Enable sounds'}
              >
                {accessibilitySettings.soundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
                {accessibilitySettings.soundEnabled ? 'Sound On' : 'Sound Off'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onToggleAccessibility}
                className="flex items-center gap-2"
                aria-label="Toggle accessibility settings"
              >
                <Accessibility className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

