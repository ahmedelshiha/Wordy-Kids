import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Grid3X3,
  List,
  Filter,
  Search,
  Volume2,
  Eye,
  Settings,
  Star,
  Heart,
  Trophy,
  Target,
  Zap,
  Accessibility,
  Smartphone,
  Monitor,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Share,
  Bookmark,
  Download,
  Shuffle,
  Play,
  Pause,
  RefreshCw,
  Brain,
} from "lucide-react";
import { JungleAdventureWordCard } from "./JungleAdventureWordCard";
import { EnhancedCategorySelector } from "./EnhancedCategorySelector";
import { EnhancedVocabularyBuilder } from "./EnhancedVocabularyBuilder";
import { CategoryCompletionPopup } from "./CategoryCompletionPopup";
import { CategoryLockWarning } from "./CategoryLockWarning";
import { wordsDatabase, getWordsByCategory } from "@/data/wordsDatabase";
import { audioService } from "@/lib/audioService";
import { useRealTimeWords, realTimeWordDB } from "@/lib/realTimeWordDatabase";
import { cacheManager, refreshWordDatabase } from "@/lib/cacheManager";
import { CategoryCompletionTracker } from "@/lib/categoryCompletionTracker";

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
  imageUrl?: string;
  masteryLevel?: number;
  lastReviewed?: Date;
  nextReview?: Date;
}

interface EnhancedWordLibraryProps {
  onBack?: () => void;
  userInterests?: string[];
  enableAdvancedFeatures?: boolean;
  showMobileOptimizations?: boolean;
}

type ViewMode = "categories" | "words" | "vocabulary";
type WordViewMode = "grid" | "list" | "carousel";

export const EnhancedWordLibrary: React.FC<EnhancedWordLibraryProps> = ({
  onBack,
  userInterests = [],
  enableAdvancedFeatures = true,
  showMobileOptimizations = true,
}) => {
  // Real-time word database integration
  const {
    words: realTimeWords,
    categories: realTimeCategories,
    lastUpdate,
    isLoading: wordsLoading,
    refresh: refreshWords,
    invalidateCaches,
  } = useRealTimeWords();

  const [viewMode, setViewMode] = useState<ViewMode>("categories");
  const [wordViewMode, setWordViewMode] = useState<WordViewMode>("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentWords, setCurrentWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteWords, setFavoriteWords] = useState<Set<number>>(new Set());
  const [bookmarkedWords, setBookmarkedWords] = useState<Set<number>>(
    new Set(),
  );
  const [refreshing, setRefreshing] = useState(false);

  // Category completion tracking
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [showLockWarning, setShowLockWarning] = useState(false);
  const [completionStats, setCompletionStats] = useState<any>(null);
  const [pendingCategorySwitch, setPendingCategorySwitch] = useState<
    string | null
  >(null);

  // Accessibility and mobile settings
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [largeTextMode, setLargeTextMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
      setShowMobileControls(width <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update current words when real-time data changes
  useEffect(() => {
    // Use real-time data if available, otherwise fall back to static data
    const wordsToUse = realTimeWords.length > 0 ? realTimeWords : wordsDatabase;

    if (selectedCategory && selectedCategory !== "all") {
      const categoryWords = wordsToUse.filter(
        (word) => word.category === selectedCategory,
      );
      setCurrentWords(categoryWords);
      setViewMode("words");

      // Start category session tracking
      CategoryCompletionTracker.startCategorySession(
        selectedCategory,
        categoryWords.length,
      );
    } else if (selectedCategory === "all") {
      setCurrentWords(wordsToUse);
      setViewMode("words");

      // Reset tracking for "all" view
      CategoryCompletionTracker.resetCurrentSession();
    }
  }, [selectedCategory, realTimeWords, lastUpdate]);

  // Setup category completion callback
  useEffect(() => {
    const handleCategoryCompletion = (stats: any) => {
      setCompletionStats({
        ...stats,
        categoryName: selectedCategory,
        categoryEmoji: getCategoryEmoji(selectedCategory),
        completionCount:
          CategoryCompletionTracker.getCategoryCompletionCount(
            selectedCategory,
          ),
      });
      setShowCompletionPopup(true);
    };

    CategoryCompletionTracker.onCategoryCompletion(handleCategoryCompletion);

    return () => {
      CategoryCompletionTracker.removeCompletionCallback(
        handleCategoryCompletion,
      );
    };
  }, [selectedCategory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      CategoryCompletionTracker.exitCategorySession();
    };
  }, []);

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshWords();
      invalidateCaches();

      // Show success feedback
      if ("vibrate" in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch (error) {
      console.error("Failed to refresh words:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter words based on search and difficulty
  const filteredWords = currentWords.filter((word) => {
    const matchesSearch =
      searchTerm === "" ||
      word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDifficulty =
      difficultyFilter === "all" || word.difficulty === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  // Helper function to get category emoji
  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      food: "🍎",
      animals: "🐱",
      nature: "🌳",
      objects: "🎾",
      body: "👋",
      clothes: "👕",
      family: "👨‍👩‍👧‍👦",
      feelings: "😊",
      colors: "🌈",
      numbers: "🔢",
    };
    return emojiMap[category] || "📚";
  };

  // Navigation handlers
  const handleCategorySelect = (categoryId: string) => {
    // Check if we should prevent category switching
    if (CategoryCompletionTracker.shouldPreventCategorySwitch()) {
      const lockedCategory = CategoryCompletionTracker.getLockedCategory();
      if (lockedCategory && lockedCategory !== categoryId) {
        setPendingCategorySwitch(categoryId);
        setShowLockWarning(true);
        return;
      }
    }

    // Proceed with category switch
    performCategorySwitch(categoryId);
  };

  const performCategorySwitch = (categoryId: string) => {
    // Exit current session
    CategoryCompletionTracker.exitCategorySession();

    setSelectedCategory(categoryId);
    setCurrentWordIndex(0);

    // Haptic feedback
    if ("vibrate" in navigator) {
      navigator.vibrate([50]);
    }
  };

  const handleWordNavigation = (direction: "prev" | "next") => {
    const oldIndex = currentWordIndex;
    let newIndex = oldIndex;

    if (direction === "prev" && currentWordIndex > 0) {
      newIndex = currentWordIndex - 1;
      setCurrentWordIndex(newIndex);
    } else if (
      direction === "next" &&
      currentWordIndex < filteredWords.length - 1
    ) {
      newIndex = currentWordIndex + 1;
      setCurrentWordIndex(newIndex);
    }

    // Track word review if moving to a new word
    if (newIndex !== oldIndex && filteredWords[oldIndex]) {
      CategoryCompletionTracker.trackWordReview(
        filteredWords[oldIndex].id,
        true,
      );
    }

    audioService.playWhooshSound();
  };

  const handleWordFavorite = (word: Word) => {
    const newFavorites = new Set(favoriteWords);
    if (favoriteWords.has(word.id)) {
      newFavorites.delete(word.id);
    } else {
      newFavorites.add(word.id);
    }
    setFavoriteWords(newFavorites);

    // Save to localStorage
    localStorage.setItem(
      "favoriteWords",
      JSON.stringify(Array.from(newFavorites)),
    );
  };

  const handleWordBookmark = (word: Word) => {
    const newBookmarks = new Set(bookmarkedWords);
    if (bookmarkedWords.has(word.id)) {
      newBookmarks.delete(word.id);
    } else {
      newBookmarks.add(word.id);
    }
    setBookmarkedWords(newBookmarks);

    // Save to localStorage
    localStorage.setItem(
      "bookmarkedWords",
      JSON.stringify(Array.from(newBookmarks)),
    );
  };

  const handleVocabularyBuilder = () => {
    setViewMode("vocabulary");
  };

  const handleShareWord = async (word: Word) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Learn the word: ${word.word}`,
          text: `${word.definition}\n\nExample: ${word.example}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `Learn the word: ${word.word}\n${word.definition}\nExample: ${word.example}`;
      navigator.clipboard?.writeText(shareText);
    }
  };

  // Load saved preferences
  useEffect(() => {
    const savedFavorites = localStorage.getItem("favoriteWords");
    if (savedFavorites) {
      setFavoriteWords(new Set(JSON.parse(savedFavorites)));
    }

    const savedBookmarks = localStorage.getItem("bookmarkedWords");
    if (savedBookmarks) {
      setBookmarkedWords(new Set(JSON.parse(savedBookmarks)));
    }

    const savedAccessibility = localStorage.getItem("accessibilitySettings");
    if (savedAccessibility) {
      const settings = JSON.parse(savedAccessibility);
      setHighContrastMode(settings.highContrast || false);
      setLargeTextMode(settings.largeText || false);
      setReducedMotion(settings.reducedMotion || false);
    }
  }, []);

  // Save accessibility preferences
  useEffect(() => {
    const settings = {
      highContrast: highContrastMode,
      largeText: largeTextMode,
      reducedMotion: reducedMotion,
    };
    localStorage.setItem("accessibilitySettings", JSON.stringify(settings));
  }, [highContrastMode, largeTextMode, reducedMotion]);

  const currentWord = filteredWords[currentWordIndex];

  return (
    <div
      ref={containerRef}
      className={`min-h-screen w-full transition-all duration-300 optimize-for-small-screen jungle-mobile-optimized jungle-pattern-bg ${
        highContrastMode ? "bg-black text-white" : "bg-responsive-dashboard"
      }`}
      style={{
        backgroundImage: highContrastMode ? "none" : undefined,
        minHeight: "100vh",
      }}
    >
      {/* Enhanced Mobile Header */}
      {isMobile && (
        <div
          className={`sticky top-0 z-50 border-b ${
            highContrastMode
              ? "bg-black border-white"
              : "bg-white/80 backdrop-blur-md border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {onBack && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onBack}
                  className="min-h-[44px] min-w-[44px] p-0"
                  aria-label="Go back"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              )}

              <h1
                className={`font-bold ${
                  largeTextMode ? "text-xl" : "text-lg"
                } ${highContrastMode ? "text-white" : "bg-gradient-to-r from-jungle to-sunshine bg-clip-text text-transparent"}`}
              >
                {viewMode === "categories"
                  ? "🌿 Jungle Word Library 🦋"
                  : viewMode === "vocabulary"
                    ? "🎧 Jungle Vocabulary Builder 🌳"
                    : selectedCategory === "all"
                      ? "🌳 All Jungle Words 🦋"
                      : `🌿 ${selectedCategory} Adventure`}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {viewMode === "words" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setWordViewMode(wordViewMode === "grid" ? "list" : "grid")
                    }
                    className="min-h-[44px] min-w-[44px] p-0"
                    aria-label={`Switch to ${wordViewMode === "grid" ? "list" : "grid"} view`}
                  >
                    {wordViewMode === "grid" ? (
                      <List className="w-4 h-4" />
                    ) : (
                      <Grid3X3 className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="min-h-[44px] min-w-[44px] p-0"
                    aria-label="Toggle filters"
                  >
                    <Filter className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={refreshing || wordsLoading}
                    className="min-h-[44px] min-w-[44px] p-0"
                    aria-label="Refresh word database"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${refreshing || wordsLoading ? "animate-spin" : ""}`}
                    />
                  </Button>
                </>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => setAccessibilityMode(!accessibilityMode)}
                className="min-h-[44px] min-w-[44px] p-0"
                aria-label="Toggle accessibility settings"
              >
                <Accessibility className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Progress Bar */}
          {viewMode === "words" && filteredWords.length > 0 && (
            <div className="px-4 pb-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>
                  Word {currentWordIndex + 1} of {filteredWords.length}
                </span>
                <div className="flex items-center gap-2">
                  {wordsLoading && (
                    <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
                  )}
                  <span className="text-green-600">
                    📚{" "}
                    {realTimeWords.length > 0
                      ? realTimeWords.length
                      : wordsDatabase.length}{" "}
                    words
                  </span>
                  <span>
                    {Math.round(
                      ((currentWordIndex + 1) / filteredWords.length) * 100,
                    )}
                    %
                  </span>
                </div>
              </div>
              <Progress
                value={((currentWordIndex + 1) / filteredWords.length) * 100}
                className="h-1"
              />
              {lastUpdate && (
                <div className="text-xs text-gray-500 mt-1 text-center">
                  Last updated: {new Date(lastUpdate).toLocaleTimeString()}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Accessibility Panel */}
      {accessibilityMode && (
        <Card
          className={`m-4 jungle-card ${highContrastMode ? "bg-gray-900 text-white border-white" : ""}`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Accessibility className="w-5 h-5" />
              Accessibility Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={highContrastMode}
                  onChange={(e) => setHighContrastMode(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>High Contrast Mode</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={largeTextMode}
                  onChange={(e) => setLargeTextMode(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Large Text</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Reduced Motion</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPlay}
                  onChange={(e) => setAutoPlay(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Auto-pronounce Words</span>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      {(showFilters || !isMobile) && viewMode === "words" && (
        <Card
          className={`m-4 jungle-card ${highContrastMode ? "bg-gray-900 text-white border-white" : "bg-gradient-to-r from-jungle/5 to-sunshine/5 border-jungle/20 shadow-lg"}`}
        >
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-jungle" />
                <Input
                  placeholder="🌿 Search jungle words..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 ${
                    highContrastMode
                      ? "bg-black text-white border-white"
                      : "border-jungle/30 focus:border-jungle"
                  }`}
                />
              </div>

              <div className="flex gap-2">
                {["all", "easy", "medium", "hard"].map((difficulty) => (
                  <Button
                    key={difficulty}
                    size="sm"
                    variant={
                      difficultyFilter === difficulty ? "default" : "outline"
                    }
                    onClick={() => setDifficultyFilter(difficulty)}
                    className={`capitalize ${
                      difficultyFilter === difficulty
                        ? "bg-gradient-to-r from-jungle to-jungle-light text-white shadow-lg"
                        : highContrastMode
                          ? "border-white text-white hover:bg-white hover:text-black"
                          : "hover:bg-jungle/10 hover:text-jungle border-jungle/30"
                    }`}
                  >
                    {difficulty}
                  </Button>
                ))}
              </div>
            </div>

            {filteredWords.length > 0 && (
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm ${highContrastMode ? "text-gray-300" : "text-jungle-dark font-medium"}`}
                >
                  🌳 {filteredWords.length} jungle words found
                </span>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleVocabularyBuilder}
                    className="flex items-center gap-2 jungle-hover-effect hover:bg-jungle/10 hover:text-jungle border-jungle/30 jungle-focus"
                  >
                    <Brain className="w-4 h-4" />
                    🌿 Practice Mode
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setCurrentWordIndex(
                        Math.floor(Math.random() * filteredWords.length),
                      )
                    }
                    className="flex items-center gap-2 jungle-hover-effect hover:bg-sunshine/10 hover:text-sunshine-dark border-sunshine/30 jungle-focus"
                  >
                    <Shuffle className="w-4 h-4" />
                    🦋 Random
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="p-4">
        {viewMode === "categories" && (
          <EnhancedCategorySelector
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            userInterests={userInterests}
            enableAccessibility={accessibilityMode}
            showAdvanced={enableAdvancedFeatures}
            showGameification={!reducedMotion}
            lockedCategory={CategoryCompletionTracker.getLockedCategory()}
          />
        )}

        {viewMode === "vocabulary" && (
          <EnhancedVocabularyBuilder
            words={filteredWords.map((word) => ({
              ...word,
              masteryLevel: Math.floor(Math.random() * 100), // Mock mastery level
            }))}
            onWordMastered={(wordId, rating) => {
              console.log(`Word ${wordId} mastered with rating: ${rating}`);
            }}
            onSessionComplete={(wordsReviewed, accuracy) => {
              console.log(
                `Session complete: ${wordsReviewed} words, ${accuracy}% accuracy`,
              );
              setViewMode("words");
            }}
            enableAccessibility={accessibilityMode}
            showAdvancedFeatures={enableAdvancedFeatures}
            autoPlay={autoPlay}
          />
        )}

        {viewMode === "words" && filteredWords.length > 0 && (
          <>
            {wordViewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredWords.map((word) => (
                  <JungleAdventureWordCard
                    key={word.id}
                    word={word}
                    onWordMastered={(wordId, rating) => {
                      // Track word completion
                      CategoryCompletionTracker.trackWordReview(
                        wordId,
                        rating !== "hard",
                      );
                      CategoryCompletionTracker.trackTimeSpent(0.5); // 30 seconds per word
                    }}
                    onWordFavorite={handleWordFavorite}
                    onWordShare={handleShareWord}
                    isWordMastered={(wordId) => favoriteWords.has(wordId) || false}
                    isWordFavorited={(wordId) => favoriteWords.has(wordId)}
                    accessibilitySettings={{
                      highContrast: highContrastMode,
                      largeText: largeTextMode,
                      reducedMotion: reducedMotion,
                      autoPlay: autoPlay,
                      soundEnabled: true
                    }}
                    showVocabularyBuilder={true}
                    showAnimations={!reducedMotion}
                    autoPlay={autoPlay}
                    className={`${reducedMotion ? "" : "animate-mobile-slide-in"}`}
                    adventureLevel={Math.floor(Math.random() * 10) + 1}
                    explorerBadges={["jungle-explorer", "word-master"]}
                    isJungleQuest={true}
                  />
                ))}
              </div>
            ) : wordViewMode === "list" ? (
              <div className="space-y-4">
                {filteredWords.map((word) => (
                  <Card
                    key={word.id}
                    className={`${highContrastMode ? "bg-gray-900 text-white border-white" : ""}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {word.emoji && (
                              <span className="text-2xl">{word.emoji}</span>
                            )}
                            <h3
                              className={`font-bold ${
                                largeTextMode ? "text-xl" : "text-lg"
                              }`}
                            >
                              {word.word}
                            </h3>
                            <Badge
                              className={`${
                                word.difficulty === "easy"
                                  ? "bg-green-500"
                                  : word.difficulty === "medium"
                                    ? "bg-orange-500"
                                    : "bg-red-500"
                              } text-white`}
                            >
                              {word.difficulty}
                            </Badge>
                          </div>
                          <p
                            className={`${
                              largeTextMode ? "text-lg" : "text-sm"
                            } ${highContrastMode ? "text-gray-300" : "text-gray-600"}`}
                          >
                            {word.definition}
                          </p>
                          {word.example && (
                            <p
                              className={`italic mt-1 ${
                                largeTextMode ? "text-base" : "text-xs"
                              } ${highContrastMode ? "text-gray-400" : "text-gray-500"}`}
                            >
                              "{word.example}"
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              audioService.pronounceWord(word.word, {})
                            }
                            className="min-h-[44px] min-w-[44px] p-0"
                            aria-label={`Pronounce ${word.word}`}
                          >
                            <Volume2 className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleWordFavorite(word)}
                            className={`min-h-[44px] min-w-[44px] p-0 ${
                              favoriteWords.has(word.id) ? "text-red-500" : ""
                            }`}
                            aria-label={
                              favoriteWords.has(word.id)
                                ? "Remove from favorites"
                                : "Add to favorites"
                            }
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                favoriteWords.has(word.id) ? "fill-current" : ""
                              }`}
                            />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShareWord(word)}
                            className="min-h-[44px] min-w-[44px] p-0"
                            aria-label={`Share ${word.word}`}
                          >
                            <Share className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // Carousel view
              <div className="max-w-2xl mx-auto">
                {currentWord && (
                  <JungleAdventureWordCard
                    word={currentWord}
                    onWordMastered={(wordId, rating) => {
                      // Track word completion
                      CategoryCompletionTracker.trackWordReview(
                        wordId,
                        rating !== "hard",
                      );
                      CategoryCompletionTracker.trackTimeSpent(0.5); // 30 seconds per word
                    }}
                    onWordFavorite={handleWordFavorite}
                    onWordShare={handleShareWord}
                    isWordMastered={(wordId) => favoriteWords.has(wordId) || false}
                    isWordFavorited={(wordId) => favoriteWords.has(wordId)}
                    accessibilitySettings={{
                      highContrast: highContrastMode,
                      largeText: largeTextMode,
                      reducedMotion: reducedMotion,
                      autoPlay: autoPlay,
                      soundEnabled: true
                    }}
                    showVocabularyBuilder={true}
                    showAnimations={!reducedMotion}
                    autoPlay={autoPlay}
                    adventureLevel={Math.floor(Math.random() * 10) + 1}
                    explorerBadges={["jungle-explorer", "word-master"]}
                    isJungleQuest={true}
                  />
                )}

                {/* Carousel Navigation */}
                <div className="flex items-center justify-between mt-6">
                  <Button
                    onClick={() => handleWordNavigation("prev")}
                    disabled={currentWordIndex === 0}
                    className="min-h-[48px] px-6"
                    aria-label="Previous word"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-4">
                    <span
                      className={`text-sm ${
                        highContrastMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {currentWordIndex + 1} of {filteredWords.length}
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setCurrentWordIndex(
                          Math.floor(Math.random() * filteredWords.length),
                        )
                      }
                      aria-label="Random word"
                    >
                      <Shuffle className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button
                    onClick={() => handleWordNavigation("next")}
                    disabled={currentWordIndex === filteredWords.length - 1}
                    className="min-h-[48px] px-6"
                    aria-label="Next word"
                  >
                    Next
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {viewMode === "words" && filteredWords.length === 0 && (
          <Card
            className={`max-w-2xl mx-auto ${highContrastMode ? "bg-gray-900 text-white border-white" : ""}`}
          >
            <CardContent className="p-8 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3
                className={`font-bold mb-2 ${
                  largeTextMode ? "text-2xl" : "text-xl"
                }`}
              >
                No words found
              </h3>
              <p
                className={`mb-4 ${
                  largeTextMode ? "text-lg" : "text-base"
                } ${highContrastMode ? "text-gray-300" : "text-gray-600"}`}
              >
                Try adjusting your search terms or filters.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setDifficultyFilter("all");
                }}
                className="min-h-[48px] px-6"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile Navigation */}
      {isMobile &&
        viewMode === "words" &&
        filteredWords.length > 0 &&
        wordViewMode === "carousel" && (
          <div
            className={`fixed bottom-4 left-4 right-4 ${
              highContrastMode ? "bg-black" : "bg-white/80"
            } backdrop-blur-md rounded-xl p-4 shadow-lg border ${
              highContrastMode ? "border-white" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <Button
                size="sm"
                onClick={() => handleWordNavigation("prev")}
                disabled={currentWordIndex === 0}
                className="min-h-[44px] min-w-[44px] p-0"
                aria-label="Previous word"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewMode("categories")}
                  className="min-h-[44px] px-4 jungle-hover-effect hover:bg-jungle/10 hover:text-jungle border-jungle/30 jungle-focus"
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  🌳 Categories
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleVocabularyBuilder}
                  className="min-h-[44px] px-4 jungle-hover-effect hover:bg-sunshine/10 hover:text-sunshine-dark border-sunshine/30 jungle-focus"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  🌿 Practice
                </Button>
              </div>

              <Button
                size="sm"
                onClick={() => handleWordNavigation("next")}
                disabled={currentWordIndex === filteredWords.length - 1}
                className="min-h-[44px] min-w-[44px] p-0"
                aria-label="Next word"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

      {/* Floating Action Button (Mobile) */}
      {isMobile && viewMode === "words" && (
        <div className="fixed bottom-20 right-4 z-40">
          <Button
            onClick={() =>
              setWordViewMode(
                wordViewMode === "grid"
                  ? "carousel"
                  : wordViewMode === "carousel"
                    ? "list"
                    : "grid",
              )
            }
            className="w-14 h-14 rounded-full jungle-button bg-gradient-to-r from-jungle to-sunshine hover:from-jungle-dark hover:to-sunshine-dark shadow-xl animate-jungle-glow"
            aria-label="Change view mode"
          >
            {wordViewMode === "grid"
              ? "📱"
              : wordViewMode === "carousel"
                ? "📋"
                : "📱"}
          </Button>
        </div>
      )}

      {/* Skip Link for Screen Readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-gradient-to-r from-jungle to-sunshine text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      {/* Category Completion Popup */}
      {showCompletionPopup && completionStats && (
        <CategoryCompletionPopup
          isOpen={showCompletionPopup}
          categoryName={completionStats.categoryName}
          categoryEmoji={completionStats.categoryEmoji}
          stats={completionStats}
          completionCount={completionStats.completionCount}
          onPlayAgain={() => {
            setShowCompletionPopup(false);
            // Reset session and restart category
            CategoryCompletionTracker.resetCurrentSession();
            performCategorySwitch(selectedCategory);
          }}
          onGoToLibrary={() => {
            setShowCompletionPopup(false);
            CategoryCompletionTracker.resetCurrentSession();
            setViewMode("categories");
            setSelectedCategory("all");
          }}
          onClose={() => {
            setShowCompletionPopup(false);
          }}
        />
      )}

      {/* Category Lock Warning */}
      {showLockWarning && (
        <CategoryLockWarning
          isOpen={showLockWarning}
          currentCategoryName={
            CategoryCompletionTracker.getLockedCategory() || ""
          }
          currentCategoryEmoji={getCategoryEmoji(
            CategoryCompletionTracker.getLockedCategory() || "",
          )}
          wordsReviewed={
            CategoryCompletionTracker.getCurrentCategoryStats()
              ?.wordsReviewed || 0
          }
          totalWords={
            CategoryCompletionTracker.getCurrentCategoryStats()?.totalWords || 0
          }
          progressPercentage={CategoryCompletionTracker.getCategoryProgress()}
          onContinueCategory={() => {
            setShowLockWarning(false);
            setPendingCategorySwitch(null);
            // Stay in current category - no action needed
          }}
          onForceLeave={() => {
            setShowLockWarning(false);
            CategoryCompletionTracker.forceUnlockCategory();
            if (pendingCategorySwitch) {
              performCategorySwitch(pendingCategorySwitch);
              setPendingCategorySwitch(null);
            }
          }}
          onCancel={() => {
            setShowLockWarning(false);
            setPendingCategorySwitch(null);
          }}
        />
      )}

      {/* Main content landmark */}
      <main id="main-content" className="sr-only">
        Current view: {viewMode}
        {viewMode === "words" &&
          currentWord &&
          `Current word: ${currentWord.word}`}
      </main>
    </div>
  );
};
