import { useState, useMemo, useCallback, useEffect } from "react";

// Types and interfaces
interface Word {
  id: number;
  word: string;
  pronunciation?: string;
  definition: string;
  example?: string;
  funFact?: string;
  emoji?: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  rarity: "common" | "rare" | "epic" | "legendary" | "mythical";
  habitat?: string;
  imageUrl?: string;
  masteryLevel?: number;
  lastReviewed?: Date;
  nextReview?: Date;
}

interface FilterState {
  searchTerm: string;
  difficultyFilter: "all" | "easy" | "medium" | "hard";
  rarityFilter: "all" | "common" | "rare" | "epic" | "legendary" | "mythical";
  categoryFilter: "all" | string;
  masteryFilter: "all" | "mastered" | "unmastered" | "in-progress";
  favoriteFilter: "all" | "favorites" | "non-favorites";
  habitatFilter: "all" | string;
  lengthFilter: "all" | "short" | "medium" | "long";
  recentFilter: "all" | "recent" | "older";
  sortBy: "alphabetical" | "difficulty" | "rarity" | "recent" | "mastery" | "random";
  sortOrder: "asc" | "desc";
}

interface FilterOptions {
  masteredWords?: Set<number>;
  favoriteWords?: Set<number>;
  userProfile?: {
    interests?: string[];
    age?: number;
    difficultyPreference?: string;
  };
  enableSmartSuggestions?: boolean;
}

interface FilterStats {
  totalWords: number;
  filteredWords: number;
  percentageShown: number;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
  rarityBreakdown: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
    mythical: number;
  };
  categoryBreakdown: { [category: string]: number };
  habitatBreakdown: { [habitat: string]: number };
  masteryBreakdown: {
    mastered: number;
    unmastered: number;
    inProgress: number;
  };
}

interface SearchSuggestion {
  text: string;
  type: "word" | "category" | "difficulty" | "rarity" | "habitat";
  count: number;
  relevance: number;
}

const DEFAULT_FILTER_STATE: FilterState = {
  searchTerm: "",
  difficultyFilter: "all",
  rarityFilter: "all",
  categoryFilter: "all",
  masteryFilter: "all",
  favoriteFilter: "all",
  habitatFilter: "all",
  lengthFilter: "all",
  recentFilter: "all",
  sortBy: "alphabetical",
  sortOrder: "asc"
};

const WORD_LENGTH_THRESHOLDS = {
  short: 5,    // 1-5 characters
  medium: 8,   // 6-8 characters
  long: Infinity // 9+ characters
};

const RECENT_THRESHOLD_DAYS = 7; // Consider words reviewed in last 7 days as "recent"

export const useJungleWordFiltering = (
  words: Word[],
  options: FilterOptions = {}
) => {
  // Filter state management
  const [filterState, setFilterState] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [quickFilters, setQuickFilters] = useState<{ [key: string]: Partial<FilterState> }>({});
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  const {
    masteredWords = new Set(),
    favoriteWords = new Set(),
    userProfile = {},
    enableSmartSuggestions = true
  } = options;

  // Memoized filter functions for performance
  const searchTermFilter = useCallback((word: Word, term: string): boolean => {
    if (!term) return true;
    
    const searchableFields = [
      word.word,
      word.definition,
      word.category,
      word.example || "",
      word.funFact || "",
      word.habitat || "",
      word.difficulty,
      word.rarity
    ];

    const normalizedTerm = term.toLowerCase().trim();
    
    // Support for multiple search terms (space-separated)
    const searchTerms = normalizedTerm.split(/\s+/).filter(t => t.length > 0);
    
    return searchTerms.every(searchTerm => 
      searchableFields.some(field => 
        field.toLowerCase().includes(searchTerm)
      )
    );
  }, []);

  const wordLengthFilter = useCallback((word: Word, lengthFilter: string): boolean => {
    if (lengthFilter === "all") return true;
    
    const wordLength = word.word.length;
    
    switch (lengthFilter) {
      case "short":
        return wordLength <= WORD_LENGTH_THRESHOLDS.short;
      case "medium":
        return wordLength > WORD_LENGTH_THRESHOLDS.short && 
               wordLength <= WORD_LENGTH_THRESHOLDS.medium;
      case "long":
        return wordLength > WORD_LENGTH_THRESHOLDS.medium;
      default:
        return true;
    }
  }, []);

  const recentFilter = useCallback((word: Word, recentFilter: string): boolean => {
    if (recentFilter === "all" || !word.lastReviewed) return true;
    
    const now = new Date();
    const reviewDate = new Date(word.lastReviewed);
    const daysDifference = (now.getTime() - reviewDate.getTime()) / (1000 * 3600 * 24);
    
    switch (recentFilter) {
      case "recent":
        return daysDifference <= RECENT_THRESHOLD_DAYS;
      case "older":
        return daysDifference > RECENT_THRESHOLD_DAYS;
      default:
        return true;
    }
  }, []);

  const masteryFilter = useCallback((word: Word, masteryFilter: string): boolean => {
    if (masteryFilter === "all") return true;
    
    const isMastered = masteredWords.has(word.id);
    const hasProgress = word.masteryLevel && word.masteryLevel > 0;
    
    switch (masteryFilter) {
      case "mastered":
        return isMastered;
      case "unmastered":
        return !isMastered && !hasProgress;
      case "in-progress":
        return !isMastered && hasProgress;
      default:
        return true;
    }
  }, [masteredWords]);

  // Main filtering logic
  const filteredWords = useMemo(() => {
    let filtered = words.filter(word => {
      // Basic filters
      const passesSearch = searchTermFilter(word, filterState.searchTerm);
      const passesDifficulty = filterState.difficultyFilter === "all" || word.difficulty === filterState.difficultyFilter;
      const passesRarity = filterState.rarityFilter === "all" || word.rarity === filterState.rarityFilter;
      const passesCategory = filterState.categoryFilter === "all" || word.category === filterState.categoryFilter;
      const passesHabitat = filterState.habitatFilter === "all" || word.habitat === filterState.habitatFilter;
      
      // Advanced filters
      const passesMastery = masteryFilter(word, filterState.masteryFilter);
      const passesFavorite = filterState.favoriteFilter === "all" || 
        (filterState.favoriteFilter === "favorites" && favoriteWords.has(word.id)) ||
        (filterState.favoriteFilter === "non-favorites" && !favoriteWords.has(word.id));
      const passesLength = wordLengthFilter(word, filterState.lengthFilter);
      const passesRecent = recentFilter(word, filterState.recentFilter);
      
      return passesSearch && passesDifficulty && passesRarity && passesCategory && 
             passesHabitat && passesMastery && passesFavorite && passesLength && passesRecent;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filterState.sortBy) {
        case "alphabetical":
          comparison = a.word.localeCompare(b.word);
          break;
        case "difficulty":
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
          break;
        case "rarity":
          const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4, mythical: 5 };
          comparison = rarityOrder[a.rarity] - rarityOrder[b.rarity];
          break;
        case "recent":
          const aDate = a.lastReviewed ? new Date(a.lastReviewed).getTime() : 0;
          const bDate = b.lastReviewed ? new Date(b.lastReviewed).getTime() : 0;
          comparison = bDate - aDate; // Most recent first
          break;
        case "mastery":
          const aMastery = a.masteryLevel || 0;
          const bMastery = b.masteryLevel || 0;
          comparison = bMastery - aMastery; // Highest mastery first
          break;
        case "random":
          comparison = Math.random() - 0.5;
          break;
        default:
          comparison = 0;
      }
      
      return filterState.sortOrder === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [
    words,
    filterState,
    searchTermFilter,
    masteryFilter,
    wordLengthFilter,
    recentFilter,
    favoriteWords,
    masteredWords
  ]);

  // Generate filter statistics
  const filterStats = useMemo((): FilterStats => {
    const totalWords = words.length;
    const filteredWordsCount = filteredWords.length;
    
    // Calculate breakdowns for all words (not just filtered)
    const difficultyBreakdown = words.reduce((acc, word) => {
      acc[word.difficulty]++;
      return acc;
    }, { easy: 0, medium: 0, hard: 0 });

    const rarityBreakdown = words.reduce((acc, word) => {
      acc[word.rarity]++;
      return acc;
    }, { common: 0, rare: 0, epic: 0, legendary: 0, mythical: 0 });

    const categoryBreakdown = words.reduce((acc, word) => {
      acc[word.category] = (acc[word.category] || 0) + 1;
      return acc;
    }, {} as { [category: string]: number });

    const habitatBreakdown = words.reduce((acc, word) => {
      if (word.habitat) {
        acc[word.habitat] = (acc[word.habitat] || 0) + 1;
      }
      return acc;
    }, {} as { [habitat: string]: number });

    const masteryBreakdown = words.reduce((acc, word) => {
      if (masteredWords.has(word.id)) {
        acc.mastered++;
      } else if (word.masteryLevel && word.masteryLevel > 0) {
        acc.inProgress++;
      } else {
        acc.unmastered++;
      }
      return acc;
    }, { mastered: 0, unmastered: 0, inProgress: 0 });

    return {
      totalWords,
      filteredWords: filteredWordsCount,
      percentageShown: totalWords > 0 ? Math.round((filteredWordsCount / totalWords) * 100) : 0,
      difficultyBreakdown,
      rarityBreakdown,
      categoryBreakdown,
      habitatBreakdown,
      masteryBreakdown
    };
  }, [words, filteredWords, masteredWords]);

  // Generate search suggestions
  const searchSuggestions = useMemo((): SearchSuggestion[] => {
    if (!enableSmartSuggestions || filterState.searchTerm.length < 2) {
      return [];
    }

    const suggestions: SearchSuggestion[] = [];
    const term = filterState.searchTerm.toLowerCase();

    // Word suggestions
    words.forEach(word => {
      if (word.word.toLowerCase().includes(term)) {
        suggestions.push({
          text: word.word,
          type: "word",
          count: 1,
          relevance: word.word.toLowerCase().indexOf(term) === 0 ? 2 : 1
        });
      }
    });

    // Category suggestions
    const categories = [...new Set(words.map(w => w.category))];
    categories.forEach(category => {
      if (category.toLowerCase().includes(term)) {
        suggestions.push({
          text: category,
          type: "category",
          count: filterStats.categoryBreakdown[category] || 0,
          relevance: category.toLowerCase().indexOf(term) === 0 ? 2 : 1
        });
      }
    });

    // Habitat suggestions
    const habitats = [...new Set(words.map(w => w.habitat).filter(Boolean))];
    habitats.forEach(habitat => {
      if (habitat && habitat.toLowerCase().includes(term)) {
        suggestions.push({
          text: habitat,
          type: "habitat",
          count: filterStats.habitatBreakdown[habitat] || 0,
          relevance: habitat.toLowerCase().indexOf(term) === 0 ? 2 : 1
        });
      }
    });

    // Sort by relevance and count
    suggestions.sort((a, b) => {
      if (a.relevance !== b.relevance) {
        return b.relevance - a.relevance;
      }
      return b.count - a.count;
    });

    return suggestions.slice(0, 8); // Limit to top 8 suggestions
  }, [words, filterState.searchTerm, enableSmartSuggestions, filterStats]);

  // Smart filter recommendations based on user profile
  const smartFilterRecommendations = useMemo(() => {
    if (!userProfile.interests || !enableSmartSuggestions) return {};

    const recommendations: { [key: string]: any } = {};

    // Recommend categories based on interests
    if (userProfile.interests.includes("animals")) {
      recommendations.categoryFilter = "animals";
    }

    // Recommend difficulty based on age
    if (userProfile.age && userProfile.age <= 4) {
      recommendations.difficultyFilter = "easy";
    } else if (userProfile.age && userProfile.age >= 6) {
      recommendations.difficultyFilter = "medium";
    }

    return recommendations;
  }, [userProfile, enableSmartSuggestions]);

  // Filter update functions
  const updateFilter = useCallback((updates: Partial<FilterState>) => {
    setFilterState(prev => ({ ...prev, ...updates }));
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    updateFilter({ searchTerm: term });
    
    // Add to search history
    if (term.length > 2 && !searchHistory.includes(term)) {
      setSearchHistory(prev => [term, ...prev.slice(0, 9)]); // Keep last 10 searches
    }
  }, [updateFilter, searchHistory]);

  const setDifficultyFilter = useCallback((difficulty: FilterState["difficultyFilter"]) => {
    updateFilter({ difficultyFilter: difficulty });
  }, [updateFilter]);

  const setRarityFilter = useCallback((rarity: FilterState["rarityFilter"]) => {
    updateFilter({ rarityFilter: rarity });
  }, [updateFilter]);

  const setCategoryFilter = useCallback((category: FilterState["categoryFilter"]) => {
    updateFilter({ categoryFilter: category });
  }, [updateFilter]);

  const setMasteryFilter = useCallback((mastery: FilterState["masteryFilter"]) => {
    updateFilter({ masteryFilter: mastery });
  }, [updateFilter]);

  const setFavoriteFilter = useCallback((favorite: FilterState["favoriteFilter"]) => {
    updateFilter({ favoriteFilter: favorite });
  }, [updateFilter]);

  const setHabitatFilter = useCallback((habitat: FilterState["habitatFilter"]) => {
    updateFilter({ habitatFilter: habitat });
  }, [updateFilter]);

  const setSortBy = useCallback((sortBy: FilterState["sortBy"]) => {
    updateFilter({ sortBy });
  }, [updateFilter]);

  const setSortOrder = useCallback((sortOrder: FilterState["sortOrder"]) => {
    updateFilter({ sortOrder });
  }, [updateFilter]);

  // Utility functions
  const clearAllFilters = useCallback(() => {
    setFilterState(DEFAULT_FILTER_STATE);
  }, []);

  const hasActiveFilters = useCallback(() => {
    return JSON.stringify(filterState) !== JSON.stringify(DEFAULT_FILTER_STATE);
  }, [filterState]);

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    Object.entries(filterState).forEach(([key, value]) => {
      if (key === "sortBy" || key === "sortOrder") return; // Don't count sorting as filters
      if (value !== (DEFAULT_FILTER_STATE as any)[key]) count++;
    });
    return count;
  }, [filterState]);

  const applyQuickFilter = useCallback((filterName: string) => {
    const quickFilter = quickFilters[filterName];
    if (quickFilter) {
      setFilterState(prev => ({ ...prev, ...quickFilter }));
    }
  }, [quickFilters]);

  const saveQuickFilter = useCallback((name: string, filter: Partial<FilterState>) => {
    setQuickFilters(prev => ({ ...prev, [name]: filter }));
  }, []);

  const getFilterPresets = useCallback(() => {
    return {
      "My Favorites": { favoriteFilter: "favorites" as const },
      "Mastered Words": { masteryFilter: "mastered" as const },
      "Need Practice": { masteryFilter: "unmastered" as const },
      "Easy Words": { difficultyFilter: "easy" as const },
      "Rare Discoveries": { rarityFilter: "rare" as const, sortBy: "rarity" as const },
      "Recent Activity": { recentFilter: "recent" as const, sortBy: "recent" as const },
      "Short Words": { lengthFilter: "short" as const },
      "Animals Only": { categoryFilter: "animals" },
      "Mythical Words": { rarityFilter: "mythical" as const }
    };
  }, []);

  // Apply smart recommendations on mount if user profile exists
  useEffect(() => {
    if (Object.keys(smartFilterRecommendations).length > 0) {
      updateFilter(smartFilterRecommendations);
    }
  }, [smartFilterRecommendations, updateFilter]);

  return {
    // Filtered results
    filteredWords,
    
    // Filter state
    filterState,
    searchTerm: filterState.searchTerm,
    difficultyFilter: filterState.difficultyFilter,
    rarityFilter: filterState.rarityFilter,
    categoryFilter: filterState.categoryFilter,
    masteryFilter: filterState.masteryFilter,
    favoriteFilter: filterState.favoriteFilter,
    habitatFilter: filterState.habitatFilter,
    lengthFilter: filterState.lengthFilter,
    recentFilter: filterState.recentFilter,
    sortBy: filterState.sortBy,
    sortOrder: filterState.sortOrder,
    
    // Filter actions
    setSearchTerm,
    setDifficultyFilter,
    setRarityFilter,
    setCategoryFilter,
    setMasteryFilter,
    setFavoriteFilter,
    setHabitatFilter,
    setSortBy,
    setSortOrder,
    updateFilter,
    clearAllFilters,
    
    // Utilities
    hasActiveFilters,
    getActiveFiltersCount,
    filterStats,
    searchSuggestions,
    searchHistory,
    
    // Quick filters
    quickFilters,
    applyQuickFilter,
    saveQuickFilter,
    getFilterPresets,
    
    // Advanced mode
    isAdvancedMode,
    setIsAdvancedMode,
    
    // Smart recommendations
    smartFilterRecommendations
  };
};

export default useJungleWordFiltering;
