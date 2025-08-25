// Search and filters component
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  X, 
  Star,
  Gem,
  Shuffle,
  Brain,
  RotateCcw
} from 'lucide-react';

export const WordLibrarySearchFilters = ({ 
  isOpen,
  onClose,
  searchTerm,
  onSearchChange,
  difficultyFilter,
  onDifficultyChange,
  rarityFilter,
  onRarityChange,
  filteredWordsCount,
  totalWordsCount,
  onRandomWord,
  onVocabularyBuilder,
  onClearFilters,
  hasActiveFilters,
  accessibilitySettings,
  isMobile
}) => {
  if (!isOpen && isMobile) return null;

  const difficulties = [
    { id: 'all', label: 'All Levels', emoji: '🌟', color: 'gray' },
    { id: 'easy', label: 'Easy', emoji: '🌱', color: 'green' },
    { id: 'medium', label: 'Medium', emoji: '🌿', color: 'yellow' },
    { id: 'hard', label: 'Hard', emoji: '🌳', color: 'red' }
  ];

  const rarities = [
    { id: 'all', label: 'All Types', emoji: '📚', color: 'gray' },
    { id: 'common', label: 'Common', emoji: '🐛', color: 'green' },
    { id: 'rare', label: 'Rare', emoji: '🦋', color: 'blue' },
    { id: 'epic', label: 'Epic', emoji: '🦜', color: 'purple' },
    { id: 'legendary', label: 'Legendary', emoji: '🦁', color: 'yellow' },
    { id: 'mythical', label: 'Mythical', emoji: '🐉', color: 'pink' }
  ];

  const FilterButton = ({ item, isSelected, onClick, type }) => (
    <Button
      size="sm"
      variant={isSelected ? "default" : "outline"}
      onClick={() => onClick(item.id)}
      className={`flex items-center gap-2 ${
        isSelected
          ? `bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 text-white shadow-lg`
          : `hover:bg-${item.color}-50 hover:text-${item.color}-700 border-${item.color}-200`
      } ${accessibilitySettings.largeText ? 'text-base px-4 py-2' : 'text-sm'}`}
    >
      <span className="text-base">{item.emoji}</span>
      {item.label}
    </Button>
  );

  const content = (
    <CardContent className="p-4 space-y-6">
      {/* Search input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Search className="w-4 h-4" />
          Search Jungle Words
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="🌿 Search for words, meanings, or fun facts..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`pl-10 ${
              accessibilitySettings.highContrast
                ? 'bg-black text-white border-white'
                : 'border-green-200 focus:border-green-400'
            } ${accessibilitySettings.largeText ? 'text-lg py-3' : ''}`}
          />
          {searchTerm && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Difficulty filter */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Star className="w-4 h-4" />
          Difficulty Level
        </label>
        <div className="flex flex-wrap gap-2">
          {difficulties.map(difficulty => (
            <FilterButton
              key={difficulty.id}
              item={difficulty}
              isSelected={difficultyFilter === difficulty.id}
              onClick={onDifficultyChange}
              type="difficulty"
            />
          ))}
        </div>
      </div>

      {/* Rarity filter */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Gem className="w-4 h-4" />
          Word Rarity
        </label>
        <div className="flex flex-wrap gap-2">
          {rarities.map(rarity => (
            <FilterButton
              key={rarity.id}
              item={rarity}
              isSelected={rarityFilter === rarity.id}
              onClick={onRarityChange}
              type="rarity"
            />
          ))}
        </div>
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌳</span>
          <div>
            <p className={`font-medium text-green-800 ${
              accessibilitySettings.largeText ? 'text-lg' : 'text-sm'
            }`}>
              {filteredWordsCount} jungle words found
            </p>
            {hasActiveFilters && (
              <p className="text-xs text-green-600">
                Filtered from {totalWordsCount} total words
              </p>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            size="sm"
            variant="outline"
            onClick={onClearFilters}
            className="flex items-center gap-1 text-green-700 border-green-300 hover:bg-green-100"
          >
            <RotateCcw className="w-3 h-3" />
            Clear
          </Button>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onVocabularyBuilder}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
        >
          <Brain className="w-4 h-4" />
          🌿 Practice Mode
        </Button>

        <Button
          onClick={onRandomWord}
          variant="outline"
          className="flex items-center gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
        >
          <Shuffle className="w-4 h-4" />
          🦋 Random Word
        </Button>
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-600">Active Filters:</p>
          <div className="flex flex-wrap gap-1">
            {searchTerm && (
              <Badge variant="secondary" className="text-xs">
                Search: "{searchTerm}"
              </Badge>
            )}
            {difficultyFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                {difficulties.find(d => d.id === difficultyFilter)?.label}
              </Badge>
            )}
            {rarityFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                {rarities.find(r => r.id === rarityFilter)?.label}
              </Badge>
            )}
          </div>
        </div>
      )}
    </CardContent>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-40 bg-black/50 flex items-end">
        <Card className={`w-full max-h-[80vh] overflow-y-auto rounded-t-xl ${
          accessibilitySettings.highContrast ? 'bg-black text-white border-white' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Search & Filter
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              aria-label="Close filters"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          {content}
        </Card>
      </div>
    );
  }

  // Desktop version
  return (
    <Card className={`${
      accessibilitySettings.highContrast 
        ? 'bg-black text-white border-white' 
        : 'bg-gradient-to-r from-green-50/50 to-emerald-50/50 border-green-200 shadow-lg'
    }`}>
      {content}
    </Card>
  );
};

