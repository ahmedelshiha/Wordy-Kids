// Word filtering and search hook
import { useState, useMemo } from 'react';

export const useWordFiltering = (words) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [masteryFilter, setMasteryFilter] = useState('all'); // all, mastered, unmastered
  const [favoriteFilter, setFavoriteFilter] = useState('all'); // all, favorites, non-favorites

  // Filter words based on all criteria
  const filteredWords = useMemo(() => {
    return words.filter(word => {
      // Search term filter
      const matchesSearch = searchTerm === '' || 
        word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (word.funFact && word.funFact.toLowerCase().includes(searchTerm.toLowerCase()));

      // Difficulty filter
      const matchesDifficulty = difficultyFilter === 'all' || word.difficulty === difficultyFilter;

      // Rarity filter
      const matchesRarity = rarityFilter === 'all' || word.rarity === rarityFilter;

      // Mastery filter (would need to be passed from parent or accessed from game state)
      const matchesMastery = masteryFilter === 'all' || 
        (masteryFilter === 'mastered' && word.isWordMastered?.(word.id)) ||
        (masteryFilter === 'unmastered' && !word.isWordMastered?.(word.id));

      // Favorite filter (would need to be passed from parent or accessed from game state)
      const matchesFavorite = favoriteFilter === 'all' ||
        (favoriteFilter === 'favorites' && word.isWordFavorited?.(word.id)) ||
        (favoriteFilter === 'non-favorites' && !word.isWordFavorited?.(word.id));

      return matchesSearch && matchesDifficulty && matchesRarity && matchesMastery && matchesFavorite;
    });
  }, [words, searchTerm, difficultyFilter, rarityFilter, masteryFilter, favoriteFilter]);

  // Get filter statistics
  const getFilterStats = () => {
    const total = words.length;
    const filtered = filteredWords.length;
    
    const difficultyStats = {
      easy: words.filter(w => w.difficulty === 'easy').length,
      medium: words.filter(w => w.difficulty === 'medium').length,
      hard: words.filter(w => w.difficulty === 'hard').length
    };

    const rarityStats = {
      common: words.filter(w => w.rarity === 'common').length,
      rare: words.filter(w => w.rarity === 'rare').length,
      epic: words.filter(w => w.rarity === 'epic').length,
      legendary: words.filter(w => w.rarity === 'legendary').length,
      mythical: words.filter(w => w.rarity === 'mythical').length
    };

    return {
      total,
      filtered,
      difficultyStats,
      rarityStats
    };
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setDifficultyFilter('all');
    setRarityFilter('all');
    setMasteryFilter('all');
    setFavoriteFilter('all');
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return searchTerm !== '' || 
           difficultyFilter !== 'all' || 
           rarityFilter !== 'all' || 
           masteryFilter !== 'all' || 
           favoriteFilter !== 'all';
  };

  // Get suggested search terms based on current words
  const getSuggestedSearchTerms = () => {
    const suggestions = new Set();
    
    words.forEach(word => {
      // Add word itself
      suggestions.add(word.word.toLowerCase());
      
      // Add category
      suggestions.add(word.category);
      
      // Add difficulty
      suggestions.add(word.difficulty);
      
      // Add rarity
      suggestions.add(word.rarity);
      
      // Add habitat if available
      if (word.habitat) {
        suggestions.add(word.habitat.toLowerCase());
      }
    });
    
    return Array.from(suggestions).sort();
  };

  return {
    // Filter states
    searchTerm,
    difficultyFilter,
    rarityFilter,
    masteryFilter,
    favoriteFilter,
    
    // Filtered results
    filteredWords,
    
    // Filter actions
    setSearchTerm,
    setDifficultyFilter,
    setRarityFilter,
    setMasteryFilter,
    setFavoriteFilter,
    clearAllFilters,
    
    // Utilities
    getFilterStats,
    hasActiveFilters,
    getSuggestedSearchTerms
  };
};

