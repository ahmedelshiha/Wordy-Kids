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

// Age modes per children's UX best practices
type AgeGroup = "3-5" | "6-8" | "9-12";

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

// Simple descriptions and fun facts per category (inspired by EnhancedCategorySelector)
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  animals: "Meet amazing creatures from pets to wild animals!",
  nature: "Explore the magical wonders of our natural world!",
  food: "Discover delicious foods and favorite meals!",
  colors: "Learn about the beautiful colors around us!",
  objects: "Explore everyday things around you!",
  body: "Learn about your amazing body!",
  family: "Meet the special people in your life!",
  feelings: "Understand and express your emotions!",
  numbers: "Count and learn with numbers!",
};

const CATEGORY_FUN_FACTS: Record<string, string> = {
  animals: "There are over 8.7 million animal species on Earth!",
  nature: "Trees can live for thousands of years!",
  food: "Honey never spoils!",
  colors: "Humans can see about 10 million colors!",
  objects: "The wheel was invented 5,500 years ago!",
  body: "Your heart beats 100,000 times a day!",
  family: "Family makes us feel loved and safe!",
  feelings: "Emotions help us understand ourselves!",
  numbers: "Zero was invented in ancient India!",
};

function getDifficultyLevel(easy: number, medium: number, hard: number) {
  const total = easy + medium + hard;
  if (total === 0) return "beginner";
  const easyPercent = (easy / total) * 100;
  if (easyPercent > 70) return "beginner";
  if (easyPercent > 40) return "intermediate";
  return "advanced";
}

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
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("6-8");
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [announce, setAnnounce] = useState("");
  const sessionStartRef = useRef<number>(Date.now());
  const [sessionElapsed, setSessionElapsed] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setSessionElapsed(Date.now() - sessionStartRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const baseFontSize = ageGroup === "3-5" ? "1.25rem" : "1.125rem";

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);

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
      setCurrentWords(
        getWordsByCategory(categoryId).filter((w) =>
          ageGroup === "3-5" ? w.difficulty === "easy" : ageGroup === "6-8" ? w.difficulty !== "hard" : true,
        ),
      );
      setAnnounce(`Selected ${categoryId} category`);
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
    [audioEnabled, ageGroup],
  );

  // Handle word pronunciation
  const handlePronounce = useCallback(
    async (word: Word) => {
      if (!audioEnabled) return;

      setIsPlaying(true);
      try {
        await audioService.pronounceWord(word.word, {
          onError: (err) => {
            try {
              console.error("Speech synthesis error:", JSON.stringify(err));
            } catch {
              console.error("Speech synthesis error:", err);
            }
            setAnnounce("Speech unavailable. Check browser audio settings.");
          },
        });
      } catch (error) {
        console.error("Error pronouncing word:", error);
        setAnnounce("Speech failed to start.");
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

      setAnnounce(wasMastered ? "Removed from mastered" : "Marked as mastered");
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

      setAnnounce(favoriteWords.has(wordId) ? "Removed from favorites" : "Added to favorites");
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
              "relative overflow-hidden rounded-2xl p-6 shadow-lg border-2 border-white/50 group",
              "bg-gradient-to-br",
              category.character.color,
              "hover:shadow-xl transition-all duration-300 transform md:hover:scale-[1.01] md:hover:-translate-y-0.5 active:scale-[0.99]",
            )}
          >
            {/* Character */}
            <div className="text-center mb-4">
              {(() => {
                const words = getWordsByCategory(category.id);
                const easy = words.filter((w) => w.difficulty === "easy").length;
                const medium = words.filter((w) => w.difficulty === "medium").length;
                const hard = words.filter((w) => w.difficulty === "hard").length;
                const difficulty = getDifficultyLevel(easy, medium, hard);
                const estimated = `${Math.ceil(words.length / 10)}-${Math.ceil(words.length / 5)} min`;
                const isRecommended =
                  (ageGroup === "3-5" && easy / Math.max(1, words.length) > 0.7) ||
                  (ageGroup === "9-12" && hard / Math.max(1, words.length) > 0.2);
                return (
                  <div className="absolute top-3 left-3 flex flex-col gap-1 text-left">
                    {isRecommended && (
                      <Badge className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 animate-pulse">⭐ For You</Badge>
                    )}
                    <Badge className="bg-white/25 border-white/40 text-white text-[10px]">{difficulty}</Badge>
                    <Badge className="bg-white/25 border-white/40 text-white text-[10px]">⏱️ {estimated}</Badge>
                  </div>
                );
              })()}

              <div
                className="text-6xl mb-2 md:group-hover:animate-gentle-bounce"
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

            {/* Description and fun fact */}
            <div className="mt-3 text-center">
              <p className="text-white/90 text-xs">
                {CATEGORY_DESCRIPTIONS[category.id] || "Discover amazing new words!"}
              </p>
              <div className="mt-2 hidden md:block">
                <p className="text-white/90 text-xs bg-white/15 rounded-lg inline-block px-2 py-1">
                  💡 {CATEGORY_FUN_FACTS[category.id] || "Words are magical!"}
                </p>
              </div>
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
            "relative overflow-hidden rounded-2xl p-6 shadow-lg border-2 border-white/50 group",
            "bg-gradient-to-br from-white to-blue-50",
            "hover:shadow-xl transition-all duration-300 transform md:hover:scale-[1.01] md:hover:-translate-y-0.5 active:scale-[0.99]",
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
                variant="secondary"
                onClick={() => handleToggleFavorite(word.id)}
                className={cn(
                  "w-8 h-8 p-0 rounded-full transition-transform hover:scale-110 active:scale-95",
                  isFavorite ? "text-red-500 bg-red-50" : "text-gray-400",
                )}
              >
                <Heart
                  className={cn("w-4 h-4", isFavorite && "fill-current")}
                />
              </Button>
            </div>
          </div>

          {/* Word display - tap to flip */}
          <div
            className="text-center mb-6 cursor-pointer select-none"
            role="button"
            tabIndex={0}
            onClick={() => setShowDefinitions(!showDefinitions)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setShowDefinitions(!showDefinitions);
            }}
            aria-label={showDefinitions ? "Hide definition" : "Show definition"}
          >
            <div className="text-6xl mb-3 md:group-hover:animate-gentle-bounce">{word.emoji || "📝"}</div>
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
              aria-label={`Pronounce ${word.word}`}
              className={cn(
                "bg-blue-500 hover:bg-blue-600 text-white rounded-full min-w-[75px] min-h-[75px] px-6 py-4 text-base transition-transform hover:scale-105 active:scale-95",
                isPlaying && "animate-pulse",
              )}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Say It
            </Button>

            <Button
              onClick={() => setShowDefinitions(!showDefinitions)}
              variant="outline"
              aria-label={showDefinitions ? "Hide definition" : "Show definition"}
              className="rounded-full min-w-[75px] min-h-[75px] px-6 py-4 text-base"
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
              aria-label={isMastered ? "Mark as not mastered" : "Mark as mastered"}
              className={cn(
                "rounded-full min-w-[75px] min-h-[75px] px-6 py-4 text-base",
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
      <div
        className="max-w-4xl mx-auto"
        onTouchStart={(e) => (touchStartXRef.current = e.changedTouches[0].clientX)}
        onTouchEnd={(e) => {
          const start = touchStartXRef.current;
          if (start == null) return;
          const dx = e.changedTouches[0].clientX - start;
          if (Math.abs(dx) > 50) {
            handleWordNavigation(dx > 0 ? "prev" : "next");
          }
          touchStartXRef.current = null;
        }}
      >
        {/* Adventure header */}
        <div className="text-center mb-8">
          <div className="text-4xl md:text-6xl mb-4">
            {categoryInfo?.character.emoji || "🌿"}
          </div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-2 leading-tight">
            <span className="md:hidden inline-flex items-center gap-2">
              {categoryInfo?.character.emoji || "🌿"} {categoryInfo?.name} Adventure
            </span>
            <span className="hidden md:inline">
              {categoryInfo?.character.name}'s {categoryInfo?.name} Adventure
            </span>
          </h1>
          <p className="hidden sm:block text-gray-600 mb-4">
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
            aria-label="Previous word"
            className="rounded-full w-[75px] h-[75px] p-0 transition-transform hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            onClick={() => handleWordNavigation("random")}
            disabled={filteredWords.length <= 1}
            variant="outline"
            aria-label="Random word"
            className="rounded-full w-[75px] h-[75px] p-0 transition-transform hover:scale-105 active:scale-95"
          >
            <Shuffle className="w-4 h-4" />
          </Button>

          <Button
            onClick={() => handleWordNavigation("next")}
            disabled={filteredWords.length <= 1}
            variant="outline"
            aria-label="Next word"
            className="rounded-full w-[75px] h-[75px] p-0 transition-transform hover:scale-105 active:scale-95"
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
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") handleWordNavigation("prev");
        if (e.key === "ArrowRight") handleWordNavigation("next");
      }}
      className={cn(
        "min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50",
        "jungle-pattern-bg relative overflow-hidden",
        className,
      )}
      style={{
        fontSize: baseFontSize,
        filter: highContrast ? "contrast(1.25) saturate(1.1)" : undefined,
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={cn("absolute top-10 left-10 text-4xl opacity-20", !reducedMotion && "animate-bounce")}>
          🌿
        </div>
        <div className={cn("absolute top-20 right-20 text-3xl opacity-15", !reducedMotion && "animate-pulse")}>
          🦋
        </div>
        <div className={cn("absolute bottom-20 left-20 text-5xl opacity-10", !reducedMotion && "animate-float")}>
          🌳
        </div>
        <div className={cn("absolute bottom-10 right-10 text-3xl opacity-20", !reducedMotion && "animate-bounce delay-1000")}>
          ⭐
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-white/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 py-2 md:px-4 md:py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back button and title */}
            <div className="flex items-center gap-4">
              {onBack && (
                <Button
                  onClick={onBack}
                  variant="secondary"
                  size="sm"
                  aria-label="Go back"
                  className="rounded-full transition-transform hover:scale-105 active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}

              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  🌟 Jungle Word Explorer
                </h1>
                <p className="hidden md:block text-sm text-gray-600">
                  Discover amazing words with jungle friends!
                </p>
              </div>
            </div>

            {/* Center: Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                onClick={() => setExploreMode("map")}
                variant={exploreMode === "map" ? "default" : "secondary"}
                size="sm"
                aria-label="Go to map"
                className="rounded-full transition-transform hover:scale-105 active:scale-95"
              >
                <Map className="w-4 h-4 mr-2" />
                Map
              </Button>

              {selectedCategory && (
                <Button
                  onClick={() => setExploreMode("adventure")}
                  variant={exploreMode === "adventure" ? "default" : "secondary"}
                  size="sm"
                  aria-label="Go to adventure"
                  className="rounded-full transition-transform hover:scale-105 active:scale-95"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Adventure
                </Button>
              )}
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2">
              {/* Age mode selector */}
              <div className="hidden md:flex items-center gap-1 border border-gray-200 rounded-full p-1">
                {(["3-5", "6-8", "9-12"] as AgeGroup[]).map((g) => (
                  <Button
                    key={g}
                    onClick={() => {
                      setAgeGroup(g);
                      setAnnounce(`Age mode set to ${g}`);
                    }}
                    variant={ageGroup === g ? "default" : "secondary"}
                    size="sm"
                    className="rounded-full px-3"
                    aria-label={`Set age mode ${g}`}
                  >
                    {g}
                  </Button>
                ))}
              </div>
              {/* Search */}
              {exploreMode === "adventure" && (
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    aria-label="Search words"
                    placeholder="Search words..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 border border-gray-200 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* View mode toggle */}
              {exploreMode === "adventure" && (
                <div className="hidden sm:flex border border-gray-200 rounded-full p-1">
                  <Button
                    onClick={() => setViewMode("cards")}
                    variant={viewMode === "cards" ? "default" : "secondary"}
                    size="sm"
                    aria-label="Cards view"
                    className="rounded-full w-10 h-10 md:w-12 md:h-12 p-0 transition-transform hover:scale-105 active:scale-95"
                  >
                    <BookOpen className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => setViewMode("list")}
                    variant={viewMode === "list" ? "default" : "secondary"}
                    size="sm"
                    aria-label="List view"
                    className="rounded-full w-10 h-10 md:w-12 md:h-12 p-0 transition-transform hover:scale-105 active:scale-95"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Audio toggle */}
              <Button
                onClick={() => setAudioEnabled(!audioEnabled)}
                variant="secondary"
                size="sm"
                aria-label={audioEnabled ? "Disable audio" : "Enable audio"}
                className="rounded-full w-10 h-10 md:w-12 md:h-12 p-0 transition-transform hover:scale-105 active:scale-95"
              >
                {audioEnabled ? (
                  <Volume2 className="w-4 h-4 text-green-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
              </Button>

              {/* High contrast toggle */}
              <Button
                onClick={() => setHighContrast(!highContrast)}
                variant="secondary"
                size="sm"
                aria-label={highContrast ? "Disable high contrast" : "Enable high contrast"}
                className="rounded-full w-10 h-10 md:w-12 md:h-12 p-0 transition-transform hover:scale-105 active:scale-95"
              >
                HC
              </Button>

              {/* User stats */}
              <div className="hidden md:flex items-center gap-3 px-3 py-1 bg-white/80 rounded-full border border-gray-200">
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
                <div className="flex items-center gap-1">
                  <span className="text-lg">⏱️</span>
                  <span className="text-sm font-bold">
                    {Math.floor(sessionElapsed / 60000)}:{String(Math.floor((sessionElapsed % 60000) / 1000)).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile: Quick Category Select */}
      <div className="md:hidden px-4 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Quick Select</span>
          {selectedCategory && (
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full h-8 px-3"
              onClick={() => {
                setExploreMode("map");
                setSelectedCategory(null);
              }}
              aria-label="Back to categories"
            >
              <Map className="w-3 h-3 mr-1" />
              Categories
            </Button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((c) => {
            const words = getWordsByCategory(c.id);
            const easy = words.filter((w) => w.difficulty === "easy").length;
            const hard = words.filter((w) => w.difficulty === "hard").length;
            const isSelected = selectedCategory === c.id;
            const isRecommended =
              (ageGroup === "3-5" && easy / Math.max(1, words.length) > 0.7) ||
              (ageGroup === "9-12" && hard / Math.max(1, words.length) > 0.2);
            return (
              <Button
                key={c.id}
                onClick={() => handleCategorySelect(c.id)}
                aria-label={`Select ${c.name} category`}
                className={cn(
                  "rounded-full min-w-[80px] h-10 px-3 text-sm flex-shrink-0 shadow-sm",
                  isSelected
                    ? cn("text-white", "bg-gradient-to-r", c.character.color)
                    : "bg-white border border-gray-200 text-gray-700",
                )}
              >
                <span className="mr-1 text-base" aria-hidden>
                  {c.character.emoji}
                </span>
                {c.name}
                {isRecommended && <span className="ml-1">⭐</span>}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {exploreMode === "map" && renderCategoryMap()}
          {exploreMode === "adventure" && renderAdventureMode()}
        </div>
      </main>


      {/* Live region for screen readers */}
      <div aria-live="polite" className="sr-only" data-testid="live-region">{announce}</div>

      {/* CSS for animations */}
      <style>{`
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
