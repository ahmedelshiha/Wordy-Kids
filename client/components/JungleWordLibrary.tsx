import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { RewardProvider } from "@/contexts/RewardContext";
import { MiniGamesProvider } from "@/contexts/MiniGamesContext";
import { ExplorerShell } from "@/components/explorer/ExplorerShell";
import { CategoryGrid } from "@/components/category/CategoryGrid";
import { CategoryTile, Category } from "@/components/category/CategoryTile";
import { WordCardUnified, Word } from "@/components/word-card/WordCardUnified";
import { wordsDatabase, getWordsByCategory } from "@/data/wordsDatabase";
import { audioService } from "@/lib/audioService";

interface JungleWordLibraryProps {
  onBack?: () => void;
  className?: string;
  initialMode?: "map" | "adventure" | "favorites";
  ageGroup?: "3-5" | "6-8" | "9-12";
  accessibilitySettings?: {
    highContrast?: boolean;
    largeText?: boolean;
    reducedMotion?: boolean;
    autoPlay?: boolean;
    soundEnabled?: boolean;
  };
}

// Default categories with jungle mascots
const JUNGLE_CATEGORIES: Omit<Category, "wordCount" | "masteredCount">[] = [
  {
    id: "animals",
    name: "Animals",
    emoji: "🦁",
    description: "Meet amazing creatures from pets to wild animals!",
    recommended: true,
    estimatedTime: "5-10 min",
  },
  {
    id: "food",
    name: "Food",
    emoji: "🍎",
    description: "Discover delicious foods and favorite meals!",
    recommended: true,
    estimatedTime: "3-8 min",
  },
  {
    id: "nature",
    name: "Nature",
    emoji: "🌳",
    description: "Explore the magical wonders of our natural world!",
    estimatedTime: "4-12 min",
  },
  {
    id: "colors",
    name: "Colors",
    emoji: "🌈",
    description: "Learn about the beautiful colors around us!",
    estimatedTime: "2-5 min",
  },
  {
    id: "body",
    name: "Body",
    emoji: "👥",
    description: "Learn about your amazing body!",
    estimatedTime: "3-7 min",
  },
  {
    id: "objects",
    name: "Objects",
    emoji: "🎲",
    description: "Explore everyday things around you!",
    estimatedTime: "4-9 min",
  },
  {
    id: "family",
    name: "Family",
    emoji: "🏠",
    description: "Meet the special people in your life!",
    estimatedTime: "3-6 min",
  },
  {
    id: "feelings",
    name: "Feelings",
    emoji: "😊",
    description: "Understand and express your emotions!",
    estimatedTime: "4-8 min",
  },
];

export const JungleWordLibrary: React.FC<JungleWordLibraryProps> = ({
  onBack,
  className,
  initialMode = "map",
  ageGroup = "6-8",
  accessibilitySettings = {},
}) => {
  const [mode, setMode] = useState<"map" | "adventure" | "favorites">(
    initialMode,
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentWords, setCurrentWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // User progress state
  const [masteredWords, setMasteredWords] = useState<Set<number>>(new Set());
  const [practiceWords, setPracticeWords] = useState<Set<number>>(new Set());
  const [favoriteWords, setFavoriteWords] = useState<Set<number>>(new Set());
  const [favoriteCategories, setFavoriteCategories] = useState<Set<string>>(
    new Set(),
  );

  // Session state
  const [sessionStats, setSessionStats] = useState({
    gems: 0,
    streak: 0,
    sessionTime: "00:00",
    wordsLearned: 0,
  });

  // Settings state
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    try {
      const mq =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mq && mq.matches) {
        setReducedMotion(true);
      }
    } catch {}
  }, []);

  const {
    highContrast: a11yHighContrast = false,
    largeText = false,
    reducedMotion: a11yReducedMotion = false,
    autoPlay = false,
    soundEnabled = true,
  } = accessibilitySettings;

  // Effective settings (merge props with state)
  const effectiveSettings = {
    highContrast: highContrast || a11yHighContrast,
    reducedMotion: reducedMotion || a11yReducedMotion,
    audioEnabled: audioEnabled && soundEnabled,
    largeText,
    autoPlay,
  };

  // Load user data on mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const savedMastered = localStorage.getItem("masteredWords");
        const savedPractice = localStorage.getItem("practiceWords");
        const savedFavorites = localStorage.getItem("favoriteWords");
        const savedFavoriteCategories =
          localStorage.getItem("favoriteCategories");
        const savedStats = localStorage.getItem("sessionStats");
        const savedSettings = localStorage.getItem("accessibilitySettings");

        if (savedMastered) {
          setMasteredWords(new Set(JSON.parse(savedMastered)));
        }
        if (savedPractice) {
          setPracticeWords(new Set(JSON.parse(savedPractice)));
        }
        if (savedFavorites) {
          setFavoriteWords(new Set(JSON.parse(savedFavorites)));
        }
        if (savedFavoriteCategories) {
          setFavoriteCategories(new Set(JSON.parse(savedFavoriteCategories)));
        }
        if (savedStats) {
          setSessionStats(JSON.parse(savedStats));
        }
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setAudioEnabled(settings.audioEnabled ?? true);
          setHighContrast(settings.highContrast ?? false);
          setReducedMotion(settings.reducedMotion ?? false);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  // Save user data when it changes
  useEffect(() => {
    localStorage.setItem(
      "masteredWords",
      JSON.stringify(Array.from(masteredWords)),
    );
  }, [masteredWords]);

  useEffect(() => {
    localStorage.setItem(
      "practiceWords",
      JSON.stringify(Array.from(practiceWords)),
    );
  }, [practiceWords]);

  useEffect(() => {
    localStorage.setItem(
      "favoriteWords",
      JSON.stringify(Array.from(favoriteWords)),
    );
  }, [favoriteWords]);

  useEffect(() => {
    localStorage.setItem(
      "favoriteCategories",
      JSON.stringify(Array.from(favoriteCategories)),
    );
  }, [favoriteCategories]);

  useEffect(() => {
    localStorage.setItem("sessionStats", JSON.stringify(sessionStats));
  }, [sessionStats]);

  useEffect(() => {
    localStorage.setItem(
      "accessibilitySettings",
      JSON.stringify({
        audioEnabled,
        highContrast,
        reducedMotion,
      }),
    );
  }, [audioEnabled, highContrast, reducedMotion]);

  // Session timer
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setSessionStats((prev) => ({
        ...prev,
        sessionTime: `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Generate categories with progress data
  const categories = useMemo((): Category[] => {
    return JUNGLE_CATEGORIES.map((categoryBase) => {
      const categoryWords = getWordsByCategory(categoryBase.id);
      const masteredCount = categoryWords.filter((word) =>
        masteredWords.has(word.id),
      ).length;
      const totalWords = categoryWords.length;

      // Calculate difficulty mix
      const difficultyMix = {
        easy: categoryWords.filter((w) => w.difficulty === "easy").length,
        medium: categoryWords.filter((w) => w.difficulty === "medium").length,
        hard: categoryWords.filter((w) => w.difficulty === "hard").length,
      };

      // Determine category status
      const completed = masteredCount === totalWords && totalWords > 0;
      const inProgress = masteredCount > 0 && masteredCount < totalWords;
      const locked = false; // For now, no categories are locked

      // Calculate gems earned (5 gems per mastered word)
      const gemsEarned = masteredCount * 5;

      // Determine crown level
      let crownLevel: Category["crownLevel"] = undefined;
      if (completed) {
        if (masteredCount >= 20) crownLevel = "gold";
        else if (masteredCount >= 10) crownLevel = "silver";
        else crownLevel = "bronze";
      }

      return {
        ...categoryBase,
        wordCount: totalWords,
        masteredCount,
        difficultyMix,
        completed,
        inProgress,
        locked,
        gemsEarned,
        crownLevel,
      };
    }).filter((cat) => cat.wordCount > 0); // Only show categories with words
  }, [masteredWords]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase();
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query),
    );
  }, [categories, searchQuery]);

  // Handle category selection
  const handleCategorySelect = useCallback(
    (category: Category) => {
      setSelectedCategory(category.id);
      const words = getWordsByCategory(category.id);

      // Filter words based on age group
      let filteredWords = words;
      if (ageGroup === "3-5") {
        filteredWords = words.filter((w) => w.difficulty === "easy");
      } else if (ageGroup === "6-8") {
        filteredWords = words.filter((w) => w.difficulty !== "hard");
      }

      setCurrentWords(filteredWords);
      setCurrentWordIndex(0);
      setMode("adventure");
      setSearchQuery("");
    },
    [ageGroup],
  );

  // Handle word interactions
  const handleSayIt = useCallback(
    async (word: Word) => {
      if (!effectiveSettings.audioEnabled) return;

      try {
        await audioService.pronounceWord(word.word);
      } catch (error) {
        console.error("Error pronouncing word:", error);
      }
    },
    [effectiveSettings.audioEnabled],
  );

  const handleNeedPractice = useCallback((wordId: number) => {
    setPracticeWords((prev) => new Set(prev).add(wordId));
    setSessionStats((prev) => ({
      ...prev,
      gems: prev.gems + 1,
      streak: prev.streak + 1,
    }));
  }, []);

  const handleMasterIt = useCallback((wordId: number) => {
    setMasteredWords((prev) => new Set(prev).add(wordId));
    setPracticeWords((prev) => {
      const newSet = new Set(prev);
      newSet.delete(wordId);
      return newSet;
    });
    setSessionStats((prev) => ({
      ...prev,
      gems: prev.gems + 5,
      wordsLearned: prev.wordsLearned + 1,
      streak: prev.streak + 1,
    }));
  }, []);

  const handleFavorite = useCallback((wordId: number) => {
    setFavoriteWords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(wordId)) {
        newSet.delete(wordId);
      } else {
        newSet.add(wordId);
      }
      return newSet;
    });
  }, []);

  // Word navigation
  const handleWordNavigation = useCallback(
    (direction: "prev" | "next") => {
      if (currentWords.length === 0) return;

      let newIndex = currentWordIndex;
      if (direction === "prev") {
        newIndex =
          currentWordIndex > 0 ? currentWordIndex - 1 : currentWords.length - 1;
      } else {
        newIndex =
          currentWordIndex < currentWords.length - 1 ? currentWordIndex + 1 : 0;
      }

      setCurrentWordIndex(newIndex);
    },
    [currentWordIndex, currentWords.length],
  );

  // Handle mode changes
  const handleModeChange = useCallback(
    (newMode: "map" | "adventure" | "favorites") => {
      setMode(newMode);

      if (newMode === "map") {
        setSelectedCategory(null);
        setCurrentWords([]);
        setCurrentWordIndex(0);
      } else if (newMode === "favorites") {
        const favoriteWordIds = Array.from(favoriteWords);
        const words = wordsDatabase.filter((word) =>
          favoriteWordIds.includes(word.id),
        );
        setCurrentWords(words);
        setCurrentWordIndex(0);
        setSelectedCategory(null);
      } else if (newMode === "adventure") {
        // If no words selected yet, load a default set
        if (currentWords.length === 0) {
          let pool: Word[] = [];
          if (selectedCategory) {
            pool = getWordsByCategory(selectedCategory);
          } else {
            pool = wordsDatabase;
          }
          // Age-based filtering
          let filtered = pool;
          if (ageGroup === "3-5") {
            filtered = pool.filter((w) => w.difficulty === "easy");
          } else if (ageGroup === "6-8") {
            filtered = pool.filter((w) => w.difficulty !== "hard");
          }
          setCurrentWords(filtered);
          setCurrentWordIndex(0);
        }
      }
    },
    [favoriteWords, currentWords.length, selectedCategory, ageGroup],
  );

  // Progress calculation for footer
  const progress = useMemo(() => {
    const totalWords = wordsDatabase.length;
    const currentProgress = masteredWords.size;
    return {
      current: currentProgress,
      total: Math.min(totalWords, 100), // Cap at 100 for UI purposes
    };
  }, [masteredWords.size]);

  // Current word for display
  const currentWord = currentWords[currentWordIndex];

  return (
    <RewardProvider>
      <MiniGamesProvider>
        <ExplorerShell
          title="Jungle Word Explorer"
          showStats={true}
          mode={mode}
          onModeChange={handleModeChange}
          onBack={onBack}
          className={className}
          gems={sessionStats.gems}
          streak={sessionStats.streak}
          sessionTime={sessionStats.sessionTime}
          progress={progress}
          audioEnabled={effectiveSettings.audioEnabled}
          onAudioToggle={() => setAudioEnabled(!audioEnabled)}
          highContrast={effectiveSettings.highContrast}
          onHighContrastToggle={() => setHighContrast(!highContrast)}
          reducedMotion={effectiveSettings.reducedMotion}
          onReducedMotionToggle={() => setReducedMotion(!reducedMotion)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showSearch={mode === "map"}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          categories={categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            emoji: cat.emoji,
            recommended: cat.recommended,
          }))}
          onCategorySelect={(categoryId) => {
            const category = categories.find((c) => c.id === categoryId);
            if (category) handleCategorySelect(category);
          }}
          selectedCategory={selectedCategory}
        >
          {/* Main Content Area */}
          <div className="max-w-7xl mx-auto px-4 py-6">
            <AnimatePresence mode="wait">
              {/* Map Mode - Category Grid */}
              {mode === "map" && (
                <motion.div
                  key="map"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CategoryGrid
                    categories={filteredCategories}
                    onCategorySelect={handleCategorySelect}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    userProgress={{
                      masteredWords,
                      favoriteCategories,
                    }}
                    reducedMotion={effectiveSettings.reducedMotion}
                    ageGroup={ageGroup}
                    showDifficulty={ageGroup !== "3-5"}
                    tileSize={ageGroup === "3-5" ? "lg" : "md"}
                  />
                </motion.div>
              )}

              {/* Adventure Mode - Word Cards */}
              {mode === "adventure" && currentWord && (
                <motion.div
                  key="adventure"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Adventure Header */}
                  <div className="text-center">
                    {selectedCategory && (
                      <div className="mb-4">
                        <h2
                          className={cn(
                            "text-2xl md:text-3xl font-bold text-gray-800 mb-2",
                            effectiveSettings.largeText &&
                              "text-3xl md:text-4xl",
                          )}
                        >
                          {
                            categories.find((c) => c.id === selectedCategory)
                              ?.emoji
                          }{" "}
                          {
                            categories.find((c) => c.id === selectedCategory)
                              ?.name
                          }{" "}
                          Adventure
                        </h2>
                        <p className="text-gray-600">
                          Word {currentWordIndex + 1} of {currentWords.length}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Word Card */}
                  <div className="flex justify-center">
                    <WordCardUnified
                      word={currentWord}
                      onSayIt={handleSayIt}
                      onNeedPractice={handleNeedPractice}
                      onMasterIt={handleMasterIt}
                      onFavorite={handleFavorite}
                      currentStars={
                        masteredWords.has(currentWord.id)
                          ? 3
                          : practiceWords.has(currentWord.id)
                            ? 1
                            : 0
                      }
                      maxStars={3}
                      masteryStatus={
                        masteredWords.has(currentWord.id)
                          ? "mastered"
                          : practiceWords.has(currentWord.id)
                            ? "practice"
                            : "none"
                      }
                      isFavorited={favoriteWords.has(currentWord.id)}
                      autoPronounce={effectiveSettings.autoPlay}
                      reducedMotion={effectiveSettings.reducedMotion}
                      ageGroup={ageGroup}
                      accessibilitySettings={effectiveSettings}
                      size={ageGroup === "3-5" ? "lg" : "md"}
                    />
                  </div>

                  {/* Navigation Controls */}
                  {currentWords.length > 1 && (
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => handleWordNavigation("prev")}
                        className={cn(
                          "px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full",
                          "transition-all duration-200 transform hover:scale-105 active:scale-95",
                          "font-medium shadow-lg min-w-[120px]",
                          effectiveSettings.highContrast &&
                            "border-2 border-blue-800",
                        )}
                        aria-label="Previous word"
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() => handleWordNavigation("next")}
                        className={cn(
                          "px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full",
                          "transition-all duration-200 transform hover:scale-105 active:scale-95",
                          "font-medium shadow-lg min-w-[120px]",
                          effectiveSettings.highContrast &&
                            "border-2 border-green-800",
                        )}
                        aria-label="Next word"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Favorites Mode */}
              {mode === "favorites" && (
                <motion.div
                  key="favorites"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {favoriteWords.size === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">⭐</div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        No favorites yet!
                      </h2>
                      <p className="text-gray-600 mb-4">
                        Add words to your favorites by tapping the heart ❤️ on
                        any word card
                      </p>
                      <button
                        onClick={() => setMode("map")}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium"
                      >
                        Explore Categories
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                          ⭐ Your Favorite Words
                        </h2>
                        <p className="text-gray-600">
                          {favoriteWords.size} word
                          {favoriteWords.size !== 1 ? "s" : ""} in your
                          collection
                        </p>
                      </div>

                      {currentWord && (
                        <div className="flex justify-center">
                          <WordCardUnified
                            word={currentWord}
                            onSayIt={handleSayIt}
                            onNeedPractice={handleNeedPractice}
                            onMasterIt={handleMasterIt}
                            onFavorite={handleFavorite}
                            currentStars={
                              masteredWords.has(currentWord.id)
                                ? 3
                                : practiceWords.has(currentWord.id)
                                  ? 1
                                  : 0
                            }
                            masteryStatus={
                              masteredWords.has(currentWord.id)
                                ? "mastered"
                                : practiceWords.has(currentWord.id)
                                  ? "practice"
                                  : "none"
                            }
                            isFavorited={true}
                            autoPronounce={effectiveSettings.autoPlay}
                            reducedMotion={effectiveSettings.reducedMotion}
                            ageGroup={ageGroup}
                            accessibilitySettings={effectiveSettings}
                            size={ageGroup === "3-5" ? "lg" : "md"}
                          />
                        </div>
                      )}

                      {currentWords.length > 1 && (
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={() => handleWordNavigation("prev")}
                            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-medium"
                          >
                            ← Previous
                          </button>
                          <button
                            onClick={() => handleWordNavigation("next")}
                            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-medium"
                          >
                            Next →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ExplorerShell>
      </MiniGamesProvider>
    </RewardProvider>
  );
};

export default JungleWordLibrary;
