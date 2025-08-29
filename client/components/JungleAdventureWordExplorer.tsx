import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Icons
import {
  ChevronLeft,
  Volume2,
  VolumeX,
  Heart,
  Star,
  Trophy,
  Zap,
  Sparkles,
  Search,
  Grid3X3,
  List,
  Shuffle,
  Settings,
  Crown,
  Map,
  BookOpen,
  Target,
  Brain,
  Eye,
  EyeOff,
} from "lucide-react";

// Import word database and utilities
import { wordsDatabase, getWordsByCategory } from "@/data/wordsDatabase";
import { audioService } from "@/lib/audioService";

// Types
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
}

interface JungleAdventureWordExplorerProps {
  onBack?: () => void;
  className?: string;
}

type ExploreMode = "map" | "categories" | "adventure" | "favorites";
type ViewMode = "cards" | "list" | "carousel";

// Jungle characters for different categories
const JUNGLE_CHARACTERS = {
  food: {
    emoji: "🐵",
    name: "Mango the Monkey",
    color: "from-orange-400 to-orange-600",
  },
  animals: {
    emoji: "🦁",
    name: "Leo the Lion",
    color: "from-yellow-400 to-amber-600",
  },
  nature: {
    emoji: "🦋",
    name: "Flutter the Butterfly",
    color: "from-blue-400 to-cyan-600",
  },
  objects: {
    emoji: "🐼",
    name: "Panda Pete",
    color: "from-gray-400 to-gray-600",
  },
  body: {
    emoji: "🐸",
    name: "Freddy the Frog",
    color: "from-green-400 to-emerald-600",
  },
  clothes: {
    emoji: "🦜",
    name: "Polly the Parrot",
    color: "from-purple-400 to-violet-600",
  },
  family: {
    emoji: "🐻",
    name: "Buddy the Bear",
    color: "from-brown-400 to-yellow-600",
  },
  feelings: {
    emoji: "🦊",
    name: "Felix the Fox",
    color: "from-red-400 to-pink-600",
  },
  colors: {
    emoji: "🌈",
    name: "Rainbow",
    color: "from-pink-400 to-purple-600",
  },
  numbers: {
    emoji: "🐨",
    name: "Count Koala",
    color: "from-indigo-400 to-blue-600",
  },
};

// Get unique categories from database
const getCategories = () => {
  const categories = [...new Set(wordsDatabase.map((word) => word.category))];
  return categories.map((category) => ({
    id: category,
    name: category.charAt(0).toUpperCase() + category.slice(1),
    character:
      JUNGLE_CHARACTERS[category as keyof typeof JUNGLE_CHARACTERS] ||
      JUNGLE_CHARACTERS.nature,
    wordCount: wordsDatabase.filter((w) => w.category === category).length,
  }));
};

export const JungleAdventureWordExplorer: React.FC<
  JungleAdventureWordExplorerProps
> = ({ onBack, className }) => {
  // Core state
  const [exploreMode, setExploreMode] = useState<ExploreMode>("map");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentWords, setCurrentWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  // User progress state
  const [masteredWords, setMasteredWords] = useState<Set<number>>(new Set());
  const [favoriteWords, setFavoriteWords] = useState<Set<number>>(new Set());
  const [userProgress, setUserProgress] = useState({
    totalWordsLearned: 0,
    streak: 0,
    gems: 0,
    level: 1,
  });

  // Settings state
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showDefinitions, setShowDefinitions] = useState(false);
  const [fontSize, setFontSize] = useState("normal");

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // Load user data on mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const savedMastered = localStorage.getItem("masteredWords");
        const savedFavorites = localStorage.getItem("favoriteWords");
        const savedProgress = localStorage.getItem("userProgress");

        if (savedMastered) {
          setMasteredWords(new Set(JSON.parse(savedMastered)));
        }
        if (savedFavorites) {
          setFavoriteWords(new Set(JSON.parse(savedFavorites)));
        }
        if (savedProgress) {
          setUserProgress(JSON.parse(savedProgress));
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
      "favoriteWords",
      JSON.stringify(Array.from(favoriteWords)),
    );
  }, [favoriteWords]);

  useEffect(() => {
    localStorage.setItem("userProgress", JSON.stringify(userProgress));
  }, [userProgress]);

  // Filter words based on search
  const filteredWords = currentWords.filter(
    (word) =>
      word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.definition.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle category selection
  const handleCategorySelect = useCallback(
    (categoryId: string) => {
      setSelectedCategory(categoryId);
      setCurrentWords(getWordsByCategory(categoryId));
      setCurrentWordIndex(0);
      setExploreMode("adventure");
      setSearchQuery("");

      // Play category select sound
      if (audioEnabled) {
        audioService.playClickSound();
      }

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    },
    [audioEnabled],
  );

  // Handle word pronunciation
  const handlePronounce = useCallback(
    async (word: Word) => {
      if (!audioEnabled) return;

      setIsPlaying(true);
      try {
        await audioService.pronounceWord(word.word, {});
      } catch (error) {
        console.error("Error pronouncing word:", error);
      } finally {
        setIsPlaying(false);
      }
    },
    [audioEnabled],
  );

  // Handle word mastery
  const handleMasterWord = useCallback(
    (wordId: number) => {
      const newMastered = new Set(masteredWords);
      const wasMastered = masteredWords.has(wordId);

      if (wasMastered) {
        newMastered.delete(wordId);
      } else {
        newMastered.add(wordId);
        // Update progress
        setUserProgress((prev) => ({
          ...prev,
          totalWordsLearned: prev.totalWordsLearned + 1,
          gems: prev.gems + 1,
        }));
      }

      setMasteredWords(newMastered);

      // Play sound effect
      if (audioEnabled) {
        audioService.playSuccessSound();
      }

      // Celebration animation
      if (navigator.vibrate) {
        navigator.vibrate([50, 100, 50]);
      }
    },
    [masteredWords, audioEnabled],
  );

  // Handle word favorite toggle
  const handleToggleFavorite = useCallback(
    (wordId: number) => {
      const newFavorites = new Set(favoriteWords);
      if (favoriteWords.has(wordId)) {
        newFavorites.delete(wordId);
      } else {
        newFavorites.add(wordId);
      }
      setFavoriteWords(newFavorites);

      if (audioEnabled) {
        audioService.playClickSound();
      }
    },
    [favoriteWords, audioEnabled],
  );

  // Handle word navigation
  const handleWordNavigation = useCallback(
    (direction: "prev" | "next" | "random") => {
      const maxIndex = filteredWords.length - 1;
      let newIndex = currentWordIndex;

      switch (direction) {
        case "prev":
          newIndex = currentWordIndex > 0 ? currentWordIndex - 1 : maxIndex;
          break;
        case "next":
          newIndex = currentWordIndex < maxIndex ? currentWordIndex + 1 : 0;
          break;
        case "random":
          newIndex = Math.floor(Math.random() * filteredWords.length);
          break;
      }

      setCurrentWordIndex(newIndex);

      if (audioEnabled) {
        audioService.playWhooshSound();
      }
    },
    [currentWordIndex, filteredWords.length, audioEnabled],
  );

  // Get categories data
  const categories = getCategories();

  // Render category map view
  const renderCategoryMap = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {categories.map((category) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer"
          onClick={() => handleCategorySelect(category.id)}
        >
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl p-6 shadow-lg border-2 border-white/50",
              "bg-gradient-to-br",
              category.character.color,
              "hover:shadow-xl transition-all duration-300",
            )}
          >
            {/* Character */}
            <div className="text-center mb-4">
              <div
                className="text-6xl mb-2 animate-bounce"
                style={{ animationDelay: `${Math.random() * 2}s` }}
              >
                {category.character.emoji}
              </div>
              <h3 className="text-white font-bold text-lg mb-1">
                {category.character.name}
              </h3>
              <p className="text-white/90 text-sm">{category.name} Expert</p>
            </div>

            {/* Stats */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-white font-bold text-2xl">
                {category.wordCount}
              </div>
              <div className="text-white/90 text-sm">Words to Discover</div>
            </div>

            {/* Progress indicator */}
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-white/80 text-xs">Progress</span>
                <span className="text-white text-xs font-bold">
                  {Math.round(
                    (Array.from(masteredWords).filter(
                      (id) =>
                        wordsDatabase.find((w) => w.id === id)?.category ===
                        category.id,
                    ).length /
                      category.wordCount) *
                      100,
                  )}
                  %
                </span>
              </div>
              <Progress
                value={
                  (Array.from(masteredWords).filter(
                    (id) =>
                      wordsDatabase.find((w) => w.id === id)?.category ===
                      category.id,
                  ).length /
                    category.wordCount) *
                  100
                }
                className="h-2 bg-white/20"
              />
            </div>

            {/* Decorative elements */}
            <div className="absolute top-2 right-2 text-white/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="absolute bottom-2 left-2 text-white/20">
              <Star className="w-4 h-4" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // Render word card
  const renderWordCard = (word: Word, index: number) => {
    const isMastered = masteredWords.has(word.id);
    const isFavorite = favoriteWords.has(word.id);

    return (
      <motion.div
        key={word.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        className="relative"
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl p-6 shadow-lg border-2 border-white/50",
            "bg-gradient-to-br from-white to-blue-50",
            "hover:shadow-xl transition-all duration-300",
            isMastered && "ring-2 ring-green-400 ring-offset-2",
          )}
        >
          {/* Header badges */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                {word.difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {word.category}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleToggleFavorite(word.id)}
                className={cn(
                  "w-8 h-8 p-0 rounded-full",
                  isFavorite ? "text-red-500 bg-red-50" : "text-gray-400",
                )}
              >
                <Heart
                  className={cn("w-4 h-4", isFavorite && "fill-current")}
                />
              </Button>
            </div>
          </div>

          {/* Word display */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">{word.emoji || "📝"}</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {word.word}
            </h2>
            {word.pronunciation && (
              <p className="text-gray-500 text-sm mb-2">{word.pronunciation}</p>
            )}
          </div>

          {/* Definition (toggleable) */}
          <AnimatePresence>
            {showDefinitions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-gray-700 mb-2">
                    <strong>Definition:</strong> {word.definition}
                  </p>
                  {word.example && (
                    <p className="text-gray-600 text-sm mb-2">
                      <strong>Example:</strong> {word.example}
                    </p>
                  )}
                  {word.funFact && (
                    <p className="text-blue-600 text-sm">
                      <strong>Fun Fact:</strong> {word.funFact}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex justify-center gap-3">
            <Button
              onClick={() => handlePronounce(word)}
              disabled={isPlaying}
              className={cn(
                "bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6 py-2",
                isPlaying && "animate-pulse",
              )}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Say It
            </Button>

            <Button
              onClick={() => setShowDefinitions(!showDefinitions)}
              variant="outline"
              className="rounded-full px-6 py-2"
            >
              {showDefinitions ? (
                <EyeOff className="w-4 h-4 mr-2" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              {showDefinitions ? "Hide" : "Show"}
            </Button>

            <Button
              onClick={() => handleMasterWord(word.id)}
              className={cn(
                "rounded-full px-6 py-2",
                isMastered
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-yellow-500 hover:bg-yellow-600 text-white",
              )}
            >
              {isMastered ? (
                <Crown className="w-4 h-4 mr-2" />
              ) : (
                <Star className="w-4 h-4 mr-2" />
              )}
              {isMastered ? "Mastered!" : "Master It"}
            </Button>
          </div>

          {/* Mastery indicator */}
          {isMastered && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-2"
            >
              <Crown className="w-4 h-4" />
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  // Render adventure mode
  const renderAdventureMode = () => {
    if (!selectedCategory || filteredWords.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌿</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No words found
          </h2>
          <p className="text-gray-600 mb-4">
            Try adjusting your search or select a different category.
          </p>
          <Button onClick={() => setExploreMode("map")}>
            <Map className="w-4 h-4 mr-2" />
            Back to Map
          </Button>
        </div>
      );
    }

    const currentWord = filteredWords[currentWordIndex];
    const categoryInfo = categories.find((c) => c.id === selectedCategory);

    return (
      <div className="max-w-4xl mx-auto">
        {/* Adventure header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">
            {categoryInfo?.character.emoji || "🌿"}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {categoryInfo?.character.name}'s {categoryInfo?.name} Adventure
          </h1>
          <p className="text-gray-600 mb-4">
            Discover amazing {categoryInfo?.name.toLowerCase()} words!
          </p>

          {/* Progress */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Badge variant="outline" className="px-4 py-2">
              Word {currentWordIndex + 1} of {filteredWords.length}
            </Badge>
            <Progress
              value={((currentWordIndex + 1) / filteredWords.length) * 100}
              className="w-32"
            />
            <Badge variant="outline" className="px-4 py-2">
              {Math.round(
                ((currentWordIndex + 1) / filteredWords.length) * 100,
              )}
              %
            </Badge>
          </div>
        </div>

        {/* Word card */}
        {viewMode === "cards" && (
          <div className="grid grid-cols-1 gap-6">
            {renderWordCard(currentWord, 0)}
          </div>
        )}

        {viewMode === "list" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWords.map((word, index) => renderWordCard(word, index))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-center gap-4 mt-8">
          <Button
            onClick={() => handleWordNavigation("prev")}
            disabled={filteredWords.length <= 1}
            variant="outline"
            className="rounded-full"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            onClick={() => handleWordNavigation("random")}
            disabled={filteredWords.length <= 1}
            variant="outline"
            className="rounded-full"
          >
            <Shuffle className="w-4 h-4" />
          </Button>

          <Button
            onClick={() => handleWordNavigation("next")}
            disabled={filteredWords.length <= 1}
            variant="outline"
            className="rounded-full"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50",
        "jungle-pattern-bg relative overflow-hidden",
        className,
      )}
      style={{
        fontSize: fontSize === "large" ? "1.125rem" : "1rem",
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-4xl opacity-20 animate-bounce">
          🌿
        </div>
        <div className="absolute top-20 right-20 text-3xl opacity-15 animate-pulse">
          🦋
        </div>
        <div className="absolute bottom-20 left-20 text-5xl opacity-10 animate-float">
          🌳
        </div>
        <div className="absolute bottom-10 right-10 text-3xl opacity-20 animate-bounce delay-1000">
          ⭐
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-white/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back button and title */}
            <div className="flex items-center gap-4">
              {onBack && (
                <Button
                  onClick={onBack}
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}

              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  🌟 Jungle Word Explorer
                </h1>
                <p className="text-sm text-gray-600">
                  Discover amazing words with jungle friends!
                </p>
              </div>
            </div>

            {/* Center: Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                onClick={() => setExploreMode("map")}
                variant={exploreMode === "map" ? "default" : "ghost"}
                size="sm"
                className="rounded-full"
              >
                <Map className="w-4 h-4 mr-2" />
                Map
              </Button>

              {selectedCategory && (
                <Button
                  onClick={() => setExploreMode("adventure")}
                  variant={exploreMode === "adventure" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-full"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Adventure
                </Button>
              )}
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2">
              {/* Search */}
              {exploreMode === "adventure" && (
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search words..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* View mode toggle */}
              {exploreMode === "adventure" && (
                <div className="flex border border-gray-200 rounded-full p-1">
                  <Button
                    onClick={() => setViewMode("cards")}
                    variant={viewMode === "cards" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-full w-8 h-8 p-0"
                  >
                    <BookOpen className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => setViewMode("list")}
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-full w-8 h-8 p-0"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Audio toggle */}
              <Button
                onClick={() => setAudioEnabled(!audioEnabled)}
                variant="ghost"
                size="sm"
                className="rounded-full w-10 h-10 p-0"
              >
                {audioEnabled ? (
                  <Volume2 className="w-4 h-4 text-green-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
              </Button>

              {/* User stats */}
              <div className="hidden sm:flex items-center gap-3 px-3 py-1 bg-white/80 rounded-full border border-gray-200">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-bold">
                    {userProgress.totalWordsLearned}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-bold">{userProgress.gems}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {exploreMode === "map" && renderCategoryMap()}
          {exploreMode === "adventure" && renderAdventureMode()}
        </div>
      </main>

      {/* Floating back button for mobile */}
      {selectedCategory && exploreMode === "adventure" && (
        <div className="fixed bottom-6 left-6 z-20 md:hidden">
          <Button
            onClick={() => {
              setExploreMode("map");
              setSelectedCategory(null);
            }}
            className="rounded-full w-12 h-12 p-0 bg-white shadow-lg border border-gray-200"
            variant="outline"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default JungleAdventureWordExplorer;
