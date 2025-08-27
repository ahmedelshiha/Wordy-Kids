import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  Crown,
  Gem,
  Shield,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { JungleAdventureWordCard } from "./JungleAdventureWordCard";
import { EnhancedCategorySelector } from "./EnhancedCategorySelector";
import { EnhancedVocabularyBuilder } from "./EnhancedVocabularyBuilder";
import { CategoryCompletionPopup } from "./CategoryCompletionPopup";
import { CategoryLockWarning } from "./CategoryLockWarning";
import { MagicalParticles, SuccessParticles, WordLearnedParticles } from "./MagicalParticles";
import { wordsDatabase, getWordsByCategory } from "@/data/wordsDatabase";
import { enhancedAudioService } from "@/lib/enhancedAudioService";
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
  // Ultimate features
  rarity?: "common" | "rare" | "epic" | "legendary" | "mythical";
  sound?: string;
  color?: string;
  habitat?: string;
}

interface EnhancedWordLibraryUltimateProps {
  onBack?: () => void;
  userInterests?: string[];
  enableAdvancedFeatures?: boolean;
  showMobileOptimizations?: boolean;
  onScoreUpdate?: (score: number) => void;
  onStreakUpdate?: (streak: number) => void;
  className?: string;
}

type ViewMode = "categories" | "words" | "vocabulary";
type WordViewMode = "grid" | "list" | "carousel" | "ultimate";
type LearningMode = "learn" | "quiz" | "memory";

export const EnhancedWordLibraryUltimate: React.FC<EnhancedWordLibraryUltimateProps> = ({
  onBack,
  userInterests = [],
  enableAdvancedFeatures = true,
  showMobileOptimizations = true,
  onScoreUpdate,
  onStreakUpdate,
  className = "",
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

  // Core states from original EnhancedWordLibrary
  const [viewMode, setViewMode] = useState<ViewMode>("categories");
  const [wordViewMode, setWordViewMode] = useState<WordViewMode>("ultimate");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentWords, setCurrentWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteWords, setFavoriteWords] = useState<Set<number>>(new Set());
  const [bookmarkedWords, setBookmarkedWords] = useState<Set<number>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  // Ultimate features from UltimateJungleWordCard
  const [learningMode, setLearningMode] = useState<LearningMode>("learn");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [masteredWords, setMasteredWords] = useState<number[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDefinition, setShowDefinition] = useState(true);
  const [currentAnimation, setCurrentAnimation] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showReward, setShowReward] = useState(false);

  // Particle effects
  const [particles, setParticles] = useState<Array<{
    id: number;
    emoji: string;
    x: number;
    y: number;
    delay: number;
  }>>([]);
  const [triggerSuccess, setTriggerSuccess] = useState(false);
  const [triggerWordLearned, setTriggerWordLearned] = useState(false);

  // Category completion tracking
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [showLockWarning, setShowLockWarning] = useState(false);
  const [completionStats, setCompletionStats] = useState<any>(null);
  const [pendingCategorySwitch, setPendingCategorySwitch] = useState<string | null>(null);

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

  // Update parent callbacks for scoring (memoized to prevent infinite loops)
  const handleScoreUpdate = useCallback((newScore: number) => {
    onScoreUpdate?.(newScore);
  }, [onScoreUpdate]);

  const handleStreakUpdate = useCallback((newStreak: number) => {
    onStreakUpdate?.(newStreak);
  }, [onStreakUpdate]);

  useEffect(() => {
    handleScoreUpdate(score);
  }, [score, handleScoreUpdate]);

  useEffect(() => {
    handleStreakUpdate(streak);
  }, [streak, handleStreakUpdate]);

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

  // Utility functions for word enhancement (defined first to avoid temporal dead zone)
  const assignRarity = useCallback((word: Word): "common" | "rare" | "epic" | "legendary" | "mythical" => {
    // Use word ID as seed for deterministic rarity assignment
    const seed = word.id || 1;
    const pseudoRandom = (seed * 9301 + 49297) % 233280 / 233280;

    const rarityThresholds = {
      easy: pseudoRandom < 0.7 ? "common" : "rare",
      medium: pseudoRandom < 0.4 ? "rare" : pseudoRandom < 0.8 ? "epic" : "legendary",
      hard: pseudoRandom < 0.3 ? "epic" : pseudoRandom < 0.7 ? "legendary" : "mythical"
    };
    return rarityThresholds[word.difficulty] as any;
  }, []);

  const generateDefaultSound = useCallback((word: Word): string => {
    const soundTemplates = {
      animals: `${word.word} sounds happy to meet you!`,
      nature: `Listen to the peaceful ${word.word}!`,
      food: `Yummy ${word.word} is delicious!`,
      objects: `Look at this amazing ${word.word}!`,
      default: `This is a wonderful ${word.word}!`
    };
    return soundTemplates[word.category as keyof typeof soundTemplates] || soundTemplates.default;
  }, []);

  const generateRarityColor = useCallback((rarity: string): string => {
    const rarityColors = {
      common: "from-green-300 via-green-400 to-green-500",
      rare: "from-blue-300 via-blue-400 to-blue-500",
      epic: "from-purple-300 via-purple-400 to-purple-500",
      legendary: "from-yellow-300 via-yellow-400 to-orange-400",
      mythical: "from-pink-300 via-purple-400 to-indigo-500"
    };
    return rarityColors[rarity as keyof typeof rarityColors] || rarityColors.common;
  }, []);

  const generateHabitat = useCallback((category: string): string => {
    const habitatMap = {
      animals: "Wild Safari",
      nature: "Peaceful Garden",
      food: "Kitchen Kingdom",
      objects: "Toy Wonderland",
      body: "Health Center",
      clothes: "Fashion Studio",
      family: "Home Sweet Home",
      feelings: "Emotion Valley",
      colors: "Rainbow Land",
      numbers: "Math Kingdom"
    };
    return habitatMap[category as keyof typeof habitatMap] || "Learning Land";
  }, []);

  // Enhanced word processing with rarity system (memoized to prevent infinite loops)
  const enhanceWordsWithRarity = useCallback((words: Word[]): Word[] => {
    return words.map(word => ({
      ...word,
      rarity: word.rarity || assignRarity(word),
      sound: word.sound || generateDefaultSound(word),
      color: word.color || generateRarityColor(word.rarity || "common"),
      habitat: word.habitat || generateHabitat(word.category),
    }));
  }, [assignRarity, generateDefaultSound, generateRarityColor, generateHabitat]);

  // Memoize enhanced words to prevent recalculation on every render
  const enhancedWords = useMemo(() => {
    const wordsToUse = realTimeWords.length > 0 ? realTimeWords : wordsDatabase;
    return enhanceWordsWithRarity(wordsToUse);
  }, [realTimeWords, enhanceWordsWithRarity, lastUpdate]);

  // Update current words when category or enhanced words change
  useEffect(() => {
    if (selectedCategory && selectedCategory !== "all") {
      const categoryWords = enhancedWords.filter(
        (word) => word.category === selectedCategory,
      );
      setCurrentWords(categoryWords);
      setViewMode("words");

      CategoryCompletionTracker.startCategorySession(
        selectedCategory,
        categoryWords.length,
      );
    } else if (selectedCategory === "all") {
      setCurrentWords(enhancedWords);
      setViewMode("words");
      CategoryCompletionTracker.resetCurrentSession();
    }
  }, [selectedCategory, enhancedWords]);

  // Create floating particles effect (from Ultimate)
  const createParticles = () => {
    const newParticles = [];
    for (let i = 0; i < 6; i++) {
      newParticles.push({
        id: Math.random(),
        emoji: ["✨", "⭐", "🌟", "💫", "🎉", "🎊"][Math.floor(Math.random() * 6)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2000);
  };

  // Play word sound with enhanced audio service
  const playWordSound = (word: Word) => {
    if (!soundEnabled) return;

    const soundText = word.sound || word.word;
    enhancedAudioService.pronounceWord(soundText, {
      onStart: () => {
        setCurrentAnimation("bounce");
        createParticles();
      },
      onEnd: () => {
        setTimeout(() => setCurrentAnimation(""), 1000);
      },
      onError: (error) => {
        console.error("Audio playback error:", error);
      }
    });
  };

  // Handle card interaction with scoring
  const handleCardClick = (word: Word) => {
    if (learningMode === "quiz" && !showDefinition) {
      setShowDefinition(true);
      playWordSound(word);
      setScore((prev) => prev + 10);
      setTriggerWordLearned(true);
    } else {
      playWordSound(word);
      setScore((prev) => prev + 5);
    }

    setIsFlipped(true);
    setTimeout(() => setIsFlipped(false), 600);
  };

  // Navigation functions
  const nextWord = () => {
    if (currentWordIndex < filteredWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setShowDefinition(learningMode !== "quiz");
      setCurrentAnimation("slideLeft");
      setTimeout(() => setCurrentAnimation(""), 300);
    }
  };

  const previousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(prev => prev - 1);
      setShowDefinition(learningMode !== "quiz");
      setCurrentAnimation("slideRight");
      setTimeout(() => setCurrentAnimation(""), 300);
    }
  };

  const shuffleWord = () => {
    const randomIndex = Math.floor(Math.random() * filteredWords.length);
    setCurrentWordIndex(randomIndex);
    setShowDefinition(learningMode !== "quiz");
    setCurrentAnimation("spin");
    setTimeout(() => setCurrentAnimation(""), 600);
  };

  // Toggle favorite with enhanced scoring
  const toggleFavorite = (word: Word) => {
    const newFavorites = new Set(favoriteWords);
    if (favoriteWords.has(word.id)) {
      newFavorites.delete(word.id);
    } else {
      newFavorites.add(word.id);
      setScore((prev) => prev + 15);
      createParticles();
      setTriggerSuccess(true);
    }
    setFavoriteWords(newFavorites);
    localStorage.setItem("favoriteWords", JSON.stringify(Array.from(newFavorites)));
  };

  // Mark as mastered with rewards
  const markMastered = (word: Word) => {
    if (!masteredWords.includes(word.id)) {
      setMasteredWords((prev) => [...prev, word.id]);
      setStreak((prev) => prev + 1);
      setScore((prev) => prev + 25);
      setShowReward(true);
      createParticles();
      setTriggerSuccess(true);
      setTimeout(() => setShowReward(false), 2000);

      // Track completion
      CategoryCompletionTracker.trackWordReview(word.id, true);
      CategoryCompletionTracker.trackTimeSpent(0.5);
    }
  };

  // Get rarity styling
  const getRarityColor = (rarity: string) => {
    const rarityBorders = {
      common: "border-green-400",
      rare: "border-blue-400", 
      epic: "border-purple-400",
      legendary: "border-yellow-400",
      mythical: "border-pink-400"
    };
    return rarityBorders[rarity as keyof typeof rarityBorders] || "border-gray-400";
  };

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: difficulty }, (_, i) => (
      <Star key={i} size={16} className="text-yellow-400 fill-current" />
    ));
  };

  // Setup category completion callback
  useEffect(() => {
    const handleCategoryCompletion = (stats: any) => {
      setCompletionStats({
        ...stats,
        categoryName: selectedCategory,
        categoryEmoji: getCategoryEmoji(selectedCategory),
        completionCount: CategoryCompletionTracker.getCategoryCompletionCount(selectedCategory),
      });
      setShowCompletionPopup(true);
    };

    CategoryCompletionTracker.onCategoryCompletion(handleCategoryCompletion);
    return () => {
      CategoryCompletionTracker.removeCompletionCallback(handleCategoryCompletion);
    };
  }, [selectedCategory]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshWords();
      invalidateCaches();
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
    if (CategoryCompletionTracker.shouldPreventCategorySwitch()) {
      const lockedCategory = CategoryCompletionTracker.getLockedCategory();
      if (lockedCategory && lockedCategory !== categoryId) {
        setPendingCategorySwitch(categoryId);
        setShowLockWarning(true);
        return;
      }
    }
    performCategorySwitch(categoryId);
  };

  const performCategorySwitch = (categoryId: string) => {
    CategoryCompletionTracker.exitCategorySession();
    setSelectedCategory(categoryId);
    setCurrentWordIndex(0);
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
    } else if (direction === "next" && currentWordIndex < filteredWords.length - 1) {
      newIndex = currentWordIndex + 1;
      setCurrentWordIndex(newIndex);
    }

    if (newIndex !== oldIndex && filteredWords[oldIndex]) {
      CategoryCompletionTracker.trackWordReview(filteredWords[oldIndex].id, true);
    }
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

    // Load ultimate features
    const savedScore = localStorage.getItem("ultimateScore");
    if (savedScore) setScore(parseInt(savedScore));

    const savedStreak = localStorage.getItem("ultimateStreak");  
    if (savedStreak) setStreak(parseInt(savedStreak));

    const savedMastered = localStorage.getItem("masteredWords");
    if (savedMastered) setMasteredWords(JSON.parse(savedMastered));
  }, []);

  // Save preferences
  useEffect(() => {
    const settings = {
      highContrast: highContrastMode,
      largeText: largeTextMode,
      reducedMotion: reducedMotion,
    };
    localStorage.setItem("accessibilitySettings", JSON.stringify(settings));
  }, [highContrastMode, largeTextMode, reducedMotion]);

  // Save ultimate progress
  useEffect(() => {
    localStorage.setItem("ultimateScore", score.toString());
  }, [score]);

  useEffect(() => {
    localStorage.setItem("ultimateStreak", streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem("masteredWords", JSON.stringify(masteredWords));
  }, [masteredWords]);

  const currentWord = filteredWords[currentWordIndex];

  return (
    <div
      ref={containerRef}
      className={cn(
        "min-h-screen w-full transition-all duration-300 optimize-for-small-screen jungle-mobile-optimized jungle-pattern-bg relative",
        highContrastMode ? "bg-black text-white" : "bg-responsive-dashboard",
        className
      )}
      style={{
        backgroundImage: highContrastMode ? "none" : undefined,
        minHeight: "100vh",
      }}
    >
      {/* Particle Effects */}
      <SuccessParticles trigger={triggerSuccess} onComplete={() => setTriggerSuccess(false)} />
      <WordLearnedParticles trigger={triggerWordLearned} onComplete={() => setTriggerWordLearned(false)} />
      
      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-2xl animate-ping pointer-events-none z-20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
          }}
        >
          {particle.emoji}
        </div>
      ))}

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
                  ? "🌿 Ultimate Jungle Library 🦋"
                  : viewMode === "vocabulary"
                    ? "🎧 Ultimate Vocabulary Builder 🌳"
                    : selectedCategory === "all"
                      ? "🌳 All Ultimate Words 🦋"
                      : `🌿 ${selectedCategory} Ultimate Adventure`}
              </h1>
            </div>

            {/* Score Display on Mobile */}
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full px-3 py-1 text-white text-sm font-bold">
                🏆 {score}
              </div>
              <div className="bg-gradient-to-r from-red-400 to-pink-500 rounded-full px-3 py-1 text-white text-sm font-bold">
                🔥 {streak}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {viewMode === "words" && filteredWords.length > 0 && (
            <div className="px-4 pb-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Word {currentWordIndex + 1} of {filteredWords.length}</span>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">
                    📚 {realTimeWords.length > 0 ? realTimeWords.length : wordsDatabase.length} words
                  </span>
                  <span>{Math.round(((currentWordIndex + 1) / filteredWords.length) * 100)}%</span>
                </div>
              </div>
              <Progress
                value={((currentWordIndex + 1) / filteredWords.length) * 100}
                className="h-1"
              />
            </div>
          )}
        </div>
      )}

      {/* Desktop Header with Stats */}
      {!isMobile && (
        <div className="flex justify-between items-center p-6 bg-white/90 backdrop-blur-sm rounded-3xl m-4 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🏆</div>
            <div>
              <div className="font-bold text-2xl text-gray-800">{score} Points</div>
              <div className="text-sm text-gray-600">Streak: {streak} 🔥</div>
            </div>
          </div>

          {/* Learning Mode Selector */}
          <div className="flex gap-2">
            {["learn", "quiz", "memory"].map((mode) => (
              <Button
                key={mode}
                onClick={() => {
                  setLearningMode(mode as LearningMode);
                  setShowDefinition(mode !== "quiz");
                }}
                variant={learningMode === mode ? "default" : "outline"}
                className={cn(
                  "font-bold transition-all",
                  learningMode === mode
                    ? "bg-jungle text-white shadow-lg scale-105"
                    : "bg-white/70 text-gray-700 hover:bg-white/80",
                )}
              >
                {mode === "learn" && "📖 Learn"}
                {mode === "quiz" && "🎯 Quiz"}
                {mode === "memory" && "🧠 Memory"}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                "p-2 rounded-full transition-all",
                soundEnabled
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-300 text-gray-600 hover:bg-gray-400",
              )}
              size="sm"
            >
              <Volume2 size={20} />
            </Button>

            <div className="text-center">
              <div className="text-2xl">📚</div>
              <div className="text-xs font-bold">
                {currentWordIndex + 1}/{filteredWords.length}
              </div>
            </div>
          </div>
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
                  placeholder="🌿 Search ultimate jungle words..."
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
                    variant={difficultyFilter === difficulty ? "default" : "outline"}
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
                  🌳 {filteredWords.length} ultimate jungle words found
                </span>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleVocabularyBuilder}
                    className="flex items-center gap-2 jungle-hover-effect hover:bg-jungle/10 hover:text-jungle border-jungle/30 jungle-focus"
                  >
                    <Brain className="w-4 h-4" />
                    🌿 Ultimate Practice
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setCurrentWordIndex(Math.floor(Math.random() * filteredWords.length))
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
              masteryLevel: masteredWords.includes(word.id) ? 100 : Math.floor(Math.random() * 100),
            }))}
            onWordMastered={(wordId, rating) => {
              const word = filteredWords.find(w => w.id === wordId);
              if (word) markMastered(word);
            }}
            onSessionComplete={(wordsReviewed, accuracy) => {
              console.log(`Ultimate session complete: ${wordsReviewed} words, ${accuracy}% accuracy`);
              setViewMode("words");
            }}
            enableAccessibility={accessibilityMode}
            showAdvancedFeatures={enableAdvancedFeatures}
            autoPlay={autoPlay}
          />
        )}

        {viewMode === "words" && filteredWords.length > 0 && (
          <>
            {wordViewMode === "ultimate" && currentWord && (
              <div className="max-w-4xl mx-auto">
                {/* Ultimate Card Display */}
                <Card
                  className={cn(
                    `relative bg-gradient-to-br ${currentWord.color || generateRarityColor(currentWord.rarity || "common")} rounded-3xl shadow-2xl overflow-hidden 
                    border-4 ${getRarityColor(currentWord.rarity || "common")} transform transition-all duration-500
                    ${currentAnimation === "bounce" ? "animate-bounce" : ""}
                    ${currentAnimation === "spin" ? "animate-spin" : ""}
                    ${currentAnimation === "slideLeft" ? "animate-pulse" : ""}
                    ${currentAnimation === "slideRight" ? "animate-pulse" : ""}
                    ${isFlipped ? "scale-110 rotate-6" : "scale-100 rotate-0"}
                    cursor-pointer hover:scale-105`,
                  )}
                >
                  {/* Card Header */}
                  <div className="bg-white/20 backdrop-blur-sm p-4 border-b border-white/30">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="text-2xl">🏠</div>
                        <div className="text-white font-bold">
                          {currentWord.habitat || generateHabitat(currentWord.category)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getDifficultyStars(currentWord.difficulty === "easy" ? 1 : currentWord.difficulty === "medium" ? 2 : 3)}
                        <Badge className="text-white font-bold capitalize bg-white/20 border-white/30">
                          {currentWord.rarity || "common"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <CardContent
                    className="p-8 text-center text-white"
                    onClick={() => handleCardClick(currentWord)}
                  >
                    {/* Emoji Display */}
                    <div className="text-9xl mb-6 transform hover:scale-110 transition-all duration-300 drop-shadow-2xl">
                      {currentWord.emoji || "📝"}
                    </div>

                    {/* Word Display */}
                    <h1 className="text-6xl font-bold mb-4 drop-shadow-lg tracking-wide">
                      {currentWord.word}
                    </h1>

                    {/* Definition (conditional based on learning mode) */}
                    {(learningMode === "learn" || (learningMode === "quiz" && showDefinition)) && (
                      <p className="text-2xl mb-6 bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                        {currentWord.definition}
                      </p>
                    )}

                    {/* Quiz Mode Hint */}
                    {learningMode === "quiz" && !showDefinition && (
                      <div className="text-2xl mb-6 bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                        🤔 What is this word? Tap to reveal!
                      </div>
                    )}

                    {/* Fun Fact */}
                    {currentWord.funFact && (
                      <div className="bg-white/10 rounded-2xl p-4 mb-6 backdrop-blur-sm">
                        <div className="text-lg font-bold mb-2 flex items-center justify-center gap-2">
                          <span>🤓</span> Fun Fact:
                        </div>
                        <div className="text-base">{currentWord.funFact}</div>
                      </div>
                    )}

                    {/* Action Buttons Row */}
                    <div className="flex justify-center gap-3 flex-wrap">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          playWordSound(currentWord);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white shadow-xl transform hover:scale-105 active:scale-95 flex items-center gap-2"
                      >
                        <Volume2 size={20} />
                        Say It!
                      </Button>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(currentWord);
                        }}
                        variant={favoriteWords.has(currentWord.id) ? "default" : "outline"}
                        className={cn(
                          "shadow-xl transform hover:scale-105 active:scale-95 flex items-center gap-2 transition-all",
                          favoriteWords.has(currentWord.id)
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-white hover:bg-gray-100 text-gray-800",
                        )}
                      >
                        <Heart
                          size={20}
                          className={favoriteWords.has(currentWord.id) ? "fill-current" : ""}
                        />
                        {favoriteWords.has(currentWord.id) ? "Loved!" : "Love It"}
                      </Button>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          markMastered(currentWord);
                        }}
                        variant={masteredWords.includes(currentWord.id) ? "default" : "outline"}
                        className={cn(
                          "shadow-xl transform hover:scale-105 active:scale-95 flex items-center gap-2 transition-all",
                          masteredWords.includes(currentWord.id)
                            ? "bg-green-500 text-white"
                            : "bg-yellow-500 hover:bg-yellow-600 text-white",
                        )}
                      >
                        <Crown size={20} />
                        {masteredWords.includes(currentWord.id) ? "Mastered!" : "Master It"}
                      </Button>
                    </div>
                  </CardContent>

                  {/* Status Badges */}
                  {masteredWords.includes(currentWord.id) && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <Shield size={16} />
                      MASTERED
                    </div>
                  )}

                  {favoriteWords.has(currentWord.id) && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <Heart size={16} className="fill-current" />
                      FAVORITE
                    </div>
                  )}
                </Card>

                {/* Navigation Controls */}
                <div className="flex justify-center items-center gap-6 mt-6 mb-6">
                  <Button
                    onClick={previousWord}
                    disabled={currentWordIndex === 0}
                    className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl transform hover:scale-110 active:scale-95 transition-all"
                    size="sm"
                  >
                    <ChevronLeft size={28} className="text-gray-700" />
                  </Button>

                  <Button
                    onClick={shuffleWord}
                    className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl transform hover:scale-110 active:scale-95 transition-all"
                    size="sm"
                  >
                    <Shuffle size={28} className="text-gray-700" />
                  </Button>

                  <Button
                    onClick={() => {
                      setCurrentWordIndex(0);
                      setShowDefinition(learningMode !== "quiz");
                    }}
                    className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl transform hover:scale-110 active:scale-95 transition-all"
                    size="sm"
                  >
                    <RotateCcw size={28} className="text-gray-700" />
                  </Button>

                  <Button
                    onClick={nextWord}
                    disabled={currentWordIndex === filteredWords.length - 1}
                    className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl transform hover:scale-110 active:scale-95 transition-all"
                    size="sm"
                  >
                    <ChevronRight size={28} className="text-gray-700" />
                  </Button>
                </div>

                {/* Progress Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 text-center shadow-xl">
                    <div className="text-3xl mb-2">❤️</div>
                    <div className="font-bold text-xl">{favoriteWords.size}</div>
                    <div className="text-sm text-gray-600">Favorites</div>
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 text-center shadow-xl">
                    <div className="text-3xl mb-2">👑</div>
                    <div className="font-bold text-xl">{masteredWords.length}</div>
                    <div className="text-sm text-gray-600">Mastered</div>
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 text-center shadow-xl">
                    <div className="text-3xl mb-2">🔥</div>
                    <div className="font-bold text-xl">{streak}</div>
                    <div className="text-sm text-gray-600">Streak</div>
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 text-center shadow-xl">
                    <div className="text-3xl mb-2">🏆</div>
                    <div className="font-bold text-xl">{score}</div>
                    <div className="text-sm text-gray-600">Score</div>
                  </div>
                </div>
              </div>
            )}

            {/* Other view modes (grid, list, carousel) - simplified for space */}
            {wordViewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredWords.map((word) => (
                  <JungleAdventureWordCard
                    key={word.id}
                    word={word}
                    onWordMastered={(wordId, rating) => {
                      const word = filteredWords.find(w => w.id === wordId);
                      if (word) markMastered(word);
                    }}
                    onWordFavorite={() => toggleFavorite(word)}
                    onWordShare={() => handleShareWord(word)}
                    isWordMastered={(wordId) => masteredWords.includes(wordId)}
                    isWordFavorited={(wordId) => favoriteWords.has(wordId)}
                    accessibilitySettings={{
                      highContrast: highContrastMode,
                      largeText: largeTextMode,
                      reducedMotion: reducedMotion,
                      autoPlay: autoPlay,
                      soundEnabled: soundEnabled,
                    }}
                    showVocabularyBuilder={true}
                    showAnimations={!reducedMotion}
                    autoPlay={autoPlay}
                    className={`${reducedMotion ? "" : "animate-mobile-slide-in"}`}
                    adventureLevel={Math.floor(Math.random() * 10) + 1}
                    explorerBadges={["ultimate-explorer", "word-master"]}
                    isJungleQuest={true}
                  />
                ))}
              </div>
            )}

            {/* Fallback for other view modes */}
            {wordViewMode !== "ultimate" && wordViewMode !== "grid" && (
              <div className="text-center p-8">
                <Button
                  onClick={() => setWordViewMode("ultimate")}
                  className="bg-gradient-to-r from-jungle to-sunshine text-white px-6 py-3 rounded-full text-lg font-bold shadow-xl"
                >
                  🌟 Switch to Ultimate Mode 🌟
                </Button>
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
              <h3 className={`font-bold mb-2 ${largeTextMode ? "text-2xl" : "text-xl"}`}>
                No ultimate words found
              </h3>
              <p
                className={`mb-4 ${largeTextMode ? "text-lg" : "text-base"} ${
                  highContrastMode ? "text-gray-300" : "text-gray-600"
                }`}
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
      {isMobile && viewMode === "words" && filteredWords.length > 0 && wordViewMode === "ultimate" && (
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
              onClick={previousWord}
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
                className="min-h-[44px] px-4"
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                🌳 Categories
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleVocabularyBuilder}
                className="min-h-[44px] px-4"
              >
                <Brain className="w-4 h-4 mr-2" />
                🌿 Practice
              </Button>
            </div>

            <Button
              size="sm"
              onClick={nextWord}
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
              setWordViewMode(wordViewMode === "ultimate" ? "grid" : "ultimate")
            }
            className="w-14 h-14 rounded-full jungle-button bg-gradient-to-r from-jungle to-sunshine hover:from-jungle-dark hover:to-sunshine-dark shadow-xl animate-jungle-glow"
            aria-label="Toggle ultimate mode"
          >
            {wordViewMode === "ultimate" ? "📱" : "🌟"}
          </Button>
        </div>
      )}

      {/* Reward Popup */}
      {showReward && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 shadow-2xl text-center transform animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-3xl font-bold text-gray-800 mb-2">Amazing!</div>
            <div className="text-xl text-gray-600">
              You mastered "{currentWord?.word}"!
            </div>
          </div>
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
          currentCategoryName={CategoryCompletionTracker.getLockedCategory() || ""}
          currentCategoryEmoji={getCategoryEmoji(
            CategoryCompletionTracker.getLockedCategory() || "",
          )}
          wordsReviewed={
            CategoryCompletionTracker.getCurrentCategoryStats()?.wordsReviewed || 0
          }
          totalWords={
            CategoryCompletionTracker.getCurrentCategoryStats()?.totalWords || 0
          }
          progressPercentage={CategoryCompletionTracker.getCategoryProgress()}
          onContinueCategory={() => {
            setShowLockWarning(false);
            setPendingCategorySwitch(null);
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
        {viewMode === "words" && currentWord && `Current word: ${currentWord.word}`}
      </main>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
