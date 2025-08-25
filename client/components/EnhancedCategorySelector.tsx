import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Star,
  Heart,
  Zap,
  Crown,
  Gift,
  Search,
  Filter,
  ChevronDown,
  X,
  Eye,
  Volume2,
  Gamepad2,
  Trophy,
  BookOpen,
  Target,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { audioService } from "@/lib/audioService";
import {
  getAllCategories,
  getWordsByCategory,
  wordsDatabase,
} from "@/data/wordsDatabase";
import { useRealTimeWords } from "@/lib/realTimeWordDatabase";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  wordCount: number;
  description: string;
  gradient: string;
  funFact: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
}

interface EnhancedCategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  userInterests?: string[];
  showAdvanced?: boolean;
  enableAccessibility?: boolean;
  showGameification?: boolean;
  lockedCategory?: string | null;
}

const enrichedCategories: Category[] = [
  {
    id: "animals",
    name: "Animals",
    icon: "🦋",
    color: "bg-educational-blue",
    gradient: "from-blue-400 to-blue-600",
    wordCount: getWordsByCategory("animals").length,
    description: "Meet amazing creatures from around the world!",
    funFact: "Some animals can taste with their feet!",
    difficulty: "beginner",
    estimatedTime: "5-10 min",
    difficultyBreakdown: {
      easy: getWordsByCategory("animals").filter((w) => w.difficulty === "easy")
        .length,
      medium: getWordsByCategory("animals").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("animals").filter((w) => w.difficulty === "hard")
        .length,
    },
  },
  {
    id: "nature",
    name: "Nature",
    icon: "🌳",
    color: "bg-educational-green",
    gradient: "from-green-400 to-green-600",
    wordCount: getWordsByCategory("nature").length,
    description: "Explore the magical wonders of our natural world!",
    funFact: "Trees can live for thousands of years!",
    difficulty: "beginner",
    estimatedTime: "8-12 min",
    difficultyBreakdown: {
      easy: getWordsByCategory("nature").filter((w) => w.difficulty === "easy")
        .length,
      medium: getWordsByCategory("nature").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("nature").filter((w) => w.difficulty === "hard")
        .length,
    },
  },
  {
    id: "food",
    name: "Food",
    icon: "🍎",
    color: "bg-educational-orange",
    gradient: "from-orange-400 to-orange-600",
    wordCount: getWordsByCategory("food").length,
    description: "Discover delicious treats and healthy foods!",
    funFact: "Some fruits change color as they ripen!",
    difficulty: "beginner",
    estimatedTime: "6-10 min",
    difficultyBreakdown: {
      easy: getWordsByCategory("food").filter((w) => w.difficulty === "easy")
        .length,
      medium: getWordsByCategory("food").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("food").filter((w) => w.difficulty === "hard")
        .length,
    },
  },
  {
    id: "body",
    name: "Body Parts",
    icon: "👤",
    color: "bg-educational-pink",
    gradient: "from-pink-400 to-pink-600",
    wordCount: getWordsByCategory("body").length,
    description: "Learn about your amazing body and all its parts!",
    funFact: "Your body has 206 bones when you're an adult!",
    difficulty: "intermediate",
    estimatedTime: "10-15 min",
    difficultyBreakdown: {
      easy: getWordsByCategory("body").filter((w) => w.difficulty === "easy")
        .length,
      medium: getWordsByCategory("body").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("body").filter((w) => w.difficulty === "hard")
        .length,
    },
  },
  {
    id: "colors",
    name: "Colors",
    icon: "🎨",
    color: "bg-educational-purple",
    gradient: "from-purple-400 to-purple-600",
    wordCount: getWordsByCategory("colors").length,
    description: "Explore the vibrant world of colors and creativity!",
    funFact: "Humans can see about 10 million different colors!",
    difficulty: "beginner",
    estimatedTime: "5-8 min",
    difficultyBreakdown: {
      easy: getWordsByCategory("colors").filter((w) => w.difficulty === "easy")
        .length,
      medium: getWordsByCategory("colors").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("colors").filter((w) => w.difficulty === "hard")
        .length,
    },
  },
  {
    id: "numbers",
    name: "Numbers",
    icon: "🔢",
    color: "bg-educational-blue",
    gradient: "from-blue-500 to-blue-700",
    wordCount: getWordsByCategory("numbers").length,
    description: "Foundation mathematics and counting skills!",
    funFact: "Zero was invented in ancient India!",
    difficulty: "beginner",
    estimatedTime: "8-12 min",
    difficultyBreakdown: {
      easy: getWordsByCategory("numbers").filter((w) => w.difficulty === "easy")
        .length,
      medium: getWordsByCategory("numbers").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("numbers").filter((w) => w.difficulty === "hard")
        .length,
    },
  },
  {
    id: "family",
    name: "Family",
    icon: "👪",
    color: "bg-educational-yellow",
    gradient: "from-yellow-400 to-yellow-600",
    wordCount: getWordsByCategory("family").length,
    description: "Learn about family members who love and care for you!",
    funFact: "Family is the most important thing in life!",
    difficulty: "beginner",
    estimatedTime: "5-8 min",
    difficultyBreakdown: {
      easy: getWordsByCategory("family").filter((w) => w.difficulty === "easy")
        .length,
      medium: getWordsByCategory("family").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("family").filter((w) => w.difficulty === "hard")
        .length,
    },
  },
  {
    id: "feelings",
    name: "Feelings",
    icon: "😊",
    color: "bg-educational-purple",
    gradient: "from-purple-400 to-purple-600",
    wordCount: getWordsByCategory("feelings").length,
    description: "Understand different emotions and how you feel!",
    funFact: "It's healthy to talk about your feelings!",
    difficulty: "intermediate",
    estimatedTime: "10-15 min",
    difficultyBreakdown: {
      easy: getWordsByCategory("feelings").filter(
        (w) => w.difficulty === "easy",
      ).length,
      medium: getWordsByCategory("feelings").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("feelings").filter(
        (w) => w.difficulty === "hard",
      ).length,
    },
  },
  {
    id: "clothes",
    name: "Clothes",
    icon: "👕",
    color: "bg-blue-500",
    gradient: "from-blue-400 to-blue-600",
    wordCount: getWordsByCategory("clothes").length,
    description: "Discover different types of clothing and fashion!",
    funFact: "The first clothing was made from animal skins!",
    difficulty: "beginner",
    estimatedTime: "6-10 min",
    difficultyBreakdown: {
      easy: getWordsByCategory("clothes").filter((w) => w.difficulty === "easy")
        .length,
      medium: getWordsByCategory("clothes").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("clothes").filter((w) => w.difficulty === "hard")
        .length,
    },
  },
].filter((category) => category.wordCount > 0);

export function EnhancedCategorySelector({
  selectedCategory,
  onSelectCategory,
  userInterests = [],
  showAdvanced = true,
  enableAccessibility = true,
  showGameification = true,
  lockedCategory = null,
}: EnhancedCategorySelectorProps) {
  // Real-time word database integration
  const {
    words: realTimeWords,
    categories: realTimeCategories,
    lastUpdate,
    isLoading: wordsLoading,
  } = useRealTimeWords();

  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [floatingElements, setFloatingElements] = useState<
    Array<{ id: string; emoji: string; x: number; y: number }>
  >([]);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [announceSelection, setAnnounceSelection] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Generate enriched categories from real-time data
  const generateEnrichedCategories = (): Category[] => {
    // Fallback to static data if real-time words are not loaded yet
    const wordsToUse = realTimeWords.length > 0 ? realTimeWords : wordsDatabase;

    if (!wordsToUse.length) return [];

    const categoryMap = new Map<string, any>();

    // Process words to build category data
    wordsToUse.forEach((word) => {
      if (!categoryMap.has(word.category)) {
        categoryMap.set(word.category, {
          words: [],
          easy: 0,
          medium: 0,
          hard: 0,
        });
      }

      const categoryData = categoryMap.get(word.category);
      categoryData.words.push(word);
      categoryData[word.difficulty]++;
    });

    // Create enriched categories with real-time data
    const enrichedCategories: Category[] = [];

    categoryMap.forEach((data, categoryId) => {
      enrichedCategories.push({
        id: categoryId,
        name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
        icon: getCategoryIcon(categoryId),
        color: getCategoryColor(categoryId),
        gradient: getCategoryGradient(categoryId),
        wordCount: data.words.length,
        description: getCategoryDescription(categoryId),
        funFact: getCategoryFunFact(categoryId),
        difficulty: getDifficultyLevel(data.easy, data.medium, data.hard),
        estimatedTime: `${Math.ceil(data.words.length / 10)}-${Math.ceil(data.words.length / 5)} min`,
        difficultyBreakdown: {
          easy: data.easy,
          medium: data.medium,
          hard: data.hard,
        },
      });
    });

    return enrichedCategories.filter((category) => category.wordCount > 0);
  };

  // Helper functions for category attributes
  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      animals: "🦋",
      nature: "🌳",
      food: "🍎",
      colors: "🌈",
      objects: "🏠",
      body: "👁️",
      family: "👨‍👩‍👧‍👦",
      feelings: "😊",
      clothes: "👕",
      numbers: "🔢",
      actions: "🏃",
      weather: "☀️",
      transportation: "🚗",
      school: "🏫",
      toys: "🧸",
      music: "🎵",
      sports: "⚽",
      greetings: "👋",
      technology: "📱",
      emotions: "😊",
      "at-the-clothes-shop": "👕",
      "at-home": "🏠",
      default: "📚",
    };
    return icons[category] || icons.default;
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      animals: "bg-educational-blue",
      nature: "bg-educational-green",
      food: "bg-educational-orange",
      colors: "bg-educational-pink",
      objects: "bg-educational-purple",
      body: "bg-educational-yellow",
      family: "bg-educational-pink",
      feelings: "bg-educational-purple",
      emotions: "bg-educational-purple",
      clothes: "bg-blue-500",
      numbers: "bg-educational-blue",
      actions: "bg-orange-500",
      weather: "bg-yellow-500",
      transportation: "bg-blue-600",
      school: "bg-indigo-500",
      toys: "bg-purple-500",
      music: "bg-green-500",
      sports: "bg-orange-600",
      greetings: "bg-blue-400",
      technology: "bg-gray-500",
      "at-the-clothes-shop": "bg-pink-500",
      "at-home": "bg-blue-400",
      default: "bg-slate-400",
    };
    return colors[category] || colors.default;
  };

  const getCategoryGradient = (category: string): string => {
    const gradients: Record<string, string> = {
      animals: "from-blue-400 to-blue-600",
      nature: "from-green-400 to-green-600",
      food: "from-orange-400 to-orange-600",
      colors: "from-pink-400 to-pink-600",
      objects: "from-purple-400 to-purple-600",
      body: "from-yellow-400 to-yellow-600",
      family: "from-pink-400 to-pink-600",
      feelings: "from-purple-400 to-purple-600",
      emotions: "from-purple-400 to-purple-600",
      clothes: "from-blue-400 to-blue-600",
      numbers: "from-blue-500 to-blue-700",
      actions: "from-orange-400 to-red-600",
      weather: "from-yellow-400 to-blue-400",
      transportation: "from-blue-400 to-green-400",
      school: "from-indigo-400 to-purple-400",
      toys: "from-purple-400 to-blue-400",
      music: "from-green-400 to-purple-400",
      sports: "from-orange-400 to-green-400",
      greetings: "from-blue-400 to-purple-400",
      technology: "from-gray-400 to-blue-400",
      "at-the-clothes-shop": "from-pink-400 to-purple-400",
      "at-home": "from-blue-400 to-cyan-400",
      default: "from-slate-400 to-slate-600",
    };
    return gradients[category] || gradients.default;
  };

  const getCategoryDescription = (category: string): string => {
    const descriptions: Record<string, string> = {
      animals: "Meet amazing creatures from pets to wild animals!",
      nature: "Explore the magical wonders of our natural world!",
      food: "Discover delicious foods and favorite meals!",
      colors: "Learn about the beautiful colors around us!",
      objects: "Explore everyday things around you!",
      body: "Learn about your amazing body!",
      family: "Meet the special people in your life!",
      feelings: "Understand and express your emotions!",
      emotions: "Learn about different emotions and feelings!",
      clothes: "Discover what we wear every day!",
      numbers: "Count and learn with numbers!",
      actions: "Learn about things we do every day!",
      weather: "Explore different types of weather!",
      transportation: "Discover how we travel and move around!",
      school: "Learn about school and education!",
      toys: "Explore fun toys and games!",
      music: "Discover the wonderful world of music!",
      sports: "Learn about different sports and activities!",
      greetings: "Learn how to say hello and goodbye!",
      technology: "Explore modern technology and gadgets!",
      "at-the-clothes-shop": "Learn about shopping for clothes!",
      "at-home": "Explore things we find at home!",
      default: "Discover amazing new words!",
    };
    return descriptions[category] || descriptions.default;
  };

  const getCategoryFunFact = (category: string): string => {
    const funFacts: Record<string, string> = {
      animals: "There are over 8.7 million animal species on Earth!",
      nature: "Trees can live for thousands of years!",
      food: "Honey never spoils!",
      colors: "Humans can see 10 million colors!",
      objects: "The wheel was invented 5,500 years ago!",
      body: "Your heart beats 100,000 times a day!",
      family: "Family makes us feel loved and safe!",
      feelings: "Emotions help us understand ourselves!",
      emotions: "We all feel different emotions every day!",
      clothes: "The first clothing was made from animal skins!",
      numbers: "Zero was invented in ancient India!",
      actions: "We do hundreds of actions every day!",
      weather: "No two snowflakes are exactly alike!",
      transportation: "The first car had three wheels!",
      school: "Learning makes your brain grow stronger!",
      toys: "Playing with toys helps you learn!",
      music: "Music can change your mood instantly!",
      sports: "Exercise makes your heart stronger!",
      greetings: "Saying hello makes people feel welcome!",
      technology: "The first computer filled an entire room!",
      "at-the-clothes-shop": "There are over 1,800 types of fabric!",
      "at-home": "Home is where memories are made!",
      default: "Words are magical!",
    };
    return funFacts[category] || funFacts.default;
  };

  const getDifficultyLevel = (
    easy: number,
    medium: number,
    hard: number,
  ): "beginner" | "intermediate" | "advanced" => {
    const total = easy + medium + hard;
    const easyPercent = (easy / total) * 100;

    if (easyPercent > 70) return "beginner";
    if (easyPercent > 40) return "intermediate";
    return "advanced";
  };

  // Get current enriched categories
  const currentEnrichedCategories = generateEnrichedCategories();

  // Debug logging
  React.useEffect(() => {
    console.log("Category Selector Debug:");
    console.log("- Real-time words count:", realTimeWords.length);
    console.log("- Real-time categories:", realTimeCategories);
    console.log(
      "- Generated categories count:",
      currentEnrichedCategories.length,
    );
    console.log(
      "- Generated categories:",
      currentEnrichedCategories.map((c) => c.name),
    );
  }, [realTimeWords, realTimeCategories, currentEnrichedCategories]);

  // Enhanced floating animation elements
  useEffect(() => {
    const elements = [
      { id: "1", emoji: "🌟", x: 10, y: 10 },
      { id: "2", emoji: "✨", x: 90, y: 20 },
      { id: "3", emoji: "🎯", x: 15, y: 80 },
      { id: "4", emoji: "��", x: 85, y: 75 },
      { id: "5", emoji: "💫", x: 50, y: 5 },
      { id: "6", emoji: "🎪", x: 25, y: 45 },
      { id: "7", emoji: "🎈", x: 75, y: 35 },
      { id: "8", emoji: "🌈", x: 35, y: 65 },
    ];
    setFloatingElements(elements);

    // Encouragement system
    if (showGameification) {
      const encouragementTimer = setInterval(() => {
        setShowEncouragement(true);
        setTimeout(() => setShowEncouragement(false), 3000);
      }, 15000);
      return () => clearInterval(encouragementTimer);
    }
  }, [showGameification]);

  // Enhanced category selection with feedback
  const handleCategoryClick = (categoryId: string) => {
    // Prevent clicking locked categories
    if (lockedCategory && lockedCategory !== categoryId) {
      return;
    }

    // Haptic feedback
    if ("vibrate" in navigator) {
      navigator.vibrate([50, 100, 50]);
    }

    // Screen reader announcement
    if (announceSelection && "speechSynthesis" in window) {
      const category = currentEnrichedCategories.find(
        (cat) => cat.id === categoryId,
      );
      if (category) {
        const utterance = new SpeechSynthesisUtterance(
          `Selected ${category.name} category with ${category.wordCount} words`,
        );
        utterance.volume = 0.5;
        speechSynthesis.speak(utterance);
      }
    }

    onSelectCategory(categoryId);
  };

  const handleCategoryHover = (categoryId: string) => {
    if (reduceMotion) return;

    setHoveredCategory(categoryId);

    // Subtle haptic feedback on hover (mobile)
    if ("vibrate" in navigator && window.innerWidth <= 768) {
      navigator.vibrate([25]);
    }
  };

  // Enhanced personalization
  const getPersonalizedMessage = () => {
    if (userInterests.length === 0) {
      return "Choose your favorite topic to start learning! 🌟";
    }

    const matchingCategories = currentEnrichedCategories.filter((cat) =>
      userInterests.some(
        (interest) =>
          cat.id.includes(interest) ||
          cat.name.toLowerCase().includes(interest.toLowerCase()),
      ),
    );

    if (matchingCategories.length > 0) {
      return `Perfect! I see you love ${matchingCategories[0].name.toLowerCase()}! 🎉`;
    }

    return "I've picked some special categories just for you! 💝";
  };

  // Enhanced filtering and search
  const getFilteredCategories = () => {
    let filtered = currentEnrichedCategories;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          category.funFact.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Difficulty filter
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(
        (category) => category.difficulty === selectedDifficulty,
      );
    }

    // Sort by relevance (matching interests first)
    const withInterests = filtered.filter((cat) =>
      userInterests.some(
        (interest) =>
          cat.id.includes(interest) ||
          cat.name.toLowerCase().includes(interest.toLowerCase()),
      ),
    );

    const withoutInterests = filtered.filter(
      (cat) =>
        !userInterests.some(
          (interest) =>
            cat.id.includes(interest) ||
            cat.name.toLowerCase().includes(interest.toLowerCase()),
        ),
    );

    return [...withInterests, ...withoutInterests];
  };

  const categories = getFilteredCategories();

  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500 text-white";
      case "intermediate":
        return "bg-orange-500 text-white";
      case "advanced":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Enhanced floating background elements */}
      {!reduceMotion && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {floatingElements.map((element) => (
            <div
              key={element.id}
              className="absolute text-xl md:text-2xl animate-bounce opacity-10 md:opacity-20"
              style={{
                left: `${element.x}%`,
                top: `${element.y}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              {element.emoji}
            </div>
          ))}
        </div>
      )}

      {/* Enhanced header with accessibility controls */}
      <div className="text-center relative px-4 md:px-0">
        {/* Accessibility controls */}
        {enableAccessibility && (
          <div className="absolute top-0 right-0 flex gap-2 z-10">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setHighContrastMode(!highContrastMode)}
              className="w-10 h-10 p-0 bg-white/90 hover:bg-white rounded-full shadow-lg"
              aria-label="Toggle high contrast mode"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setReduceMotion(!reduceMotion)}
              className="w-10 h-10 p-0 bg-white/90 hover:bg-white rounded-full shadow-lg"
              aria-label="Toggle reduced motion"
            >
              <Target className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAnnounceSelection(!announceSelection)}
              className="w-10 h-10 p-0 bg-white/90 hover:bg-white rounded-full shadow-lg"
              aria-label="Toggle voice announcements"
            >
              <Volume2 className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Mobile-optimized enhanced header */}
        <div className="md:hidden mb-6">
          <div
            className={`rounded-2xl p-6 border-2 backdrop-blur-sm ${
              highContrastMode
                ? "bg-black text-white border-white"
                : "bg-gradient-to-br from-jungle/5 via-white to-educational-blue/5 border-jungle/20 shadow-lg"
            }`}
          >
            {/* Premium Title */}
            <div className="text-center mb-4">
              <h1
                className={`text-xl font-bold mb-2 leading-relaxed ${
                  highContrastMode
                    ? "text-white"
                    : "text-slate-800"
                }`}
              >
                🌿 Welcome to the Jungle Adventure Library! 🦋
              </h1>
              <p
                className={`text-sm font-medium ${
                  highContrastMode ? "text-white/80" : "text-jungle/70"
                }`}
              >
                Choose your favorite topic to start learning!
              </p>
            </div>

            {/* Flying badges with improved animations */}
            <div className="flex justify-center gap-2 mb-4 flex-wrap">
              <Badge className="bg-jungle text-white px-3 py-1.5 text-xs font-semibold rounded-full shadow-md animate-gentle-bounce">
                🌳 {realTimeWords.length > 0 ? realTimeWords.length : wordsDatabase.length} Adventure Words
              </Badge>
              <Badge className="bg-educational-blue text-white px-3 py-1.5 text-xs font-semibold rounded-full shadow-md animate-gentle-bounce" style={{animationDelay: '0.2s'}}>
                ��� {categories.length} Jungle Paths
              </Badge>
              <Badge className="bg-educational-purple text-white px-3 py-1.5 text-xs font-semibold rounded-full shadow-md animate-gentle-bounce" style={{animationDelay: '0.4s'}}>
                ⭐ 3 Adventure Levels
              </Badge>
            </div>

            {/* Integrated search */}
            <div className="relative">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="🌿 Explore jungle categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-12 pr-12 py-3 rounded-full border-2 focus:ring-2 focus:ring-jungle/30 bg-white/80 backdrop-blur-sm ${
                  highContrastMode
                    ? "border-white text-white bg-black"
                    : "border-jungle/20 text-slate-700 hover:border-jungle/30 focus:border-jungle/40"
                }`}
                aria-label="Search jungle categories"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-jungle/60" />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-jungle/10"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop enhanced premium header */}
        <div className="hidden md:block">
          <div
            className={`rounded-3xl p-8 mb-8 border-2 backdrop-blur-lg relative overflow-hidden ${
              highContrastMode
                ? "bg-black text-white border-white"
                : "bg-gradient-to-br from-jungle/8 via-white/90 to-educational-blue/8 border-jungle/20 shadow-2xl"
            }`}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-jungle/5 to-educational-blue/5 opacity-50" />

            {/* Content */}
            <div className="relative z-10">
              {/* Premium Title Section */}
              <div className="text-center mb-6">
                <h1
                  className={`text-4xl font-bold mb-3 leading-relaxed tracking-wide ${
                    highContrastMode
                      ? "text-white"
                      : "text-slate-800"
                  }`}
                >
                  🌿 Welcome to the Jungle Adventure Library! 🦋
                </h1>
                <p
                  className={`text-xl font-medium max-w-3xl mx-auto ${
                    highContrastMode ? "text-white/90" : "text-jungle/80"
                  }`}
                >
                  Choose your favorite topic to start learning!
                </p>
              </div>

              {/* Enhanced Flying Badges */}
              <div className="flex justify-center gap-4 mb-6 flex-wrap">
                <Badge className="bg-jungle text-white px-6 py-3 text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-gentle-float">
                  🌳 {realTimeWords.length > 0 ? realTimeWords.length : wordsDatabase.length} Adventure Words
                </Badge>
                <Badge className="bg-educational-blue text-white px-6 py-3 text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-gentle-float" style={{animationDelay: '0.5s'}}>
                  🎯 {categories.length} Jungle Paths
                </Badge>
                <Badge className="bg-educational-purple text-white px-6 py-3 text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-gentle-float" style={{animationDelay: '1s'}}>
                  ⭐ 3 Adventure Levels
                </Badge>
              </div>

              {/* Integrated Premium Search */}
              <div className="max-w-lg mx-auto">
                <div className="relative">
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="🌿 Explore jungle categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-14 pr-14 py-4 text-lg rounded-full border-2 focus:ring-4 focus:ring-jungle/20 bg-white/90 backdrop-blur-sm shadow-md transition-all duration-300 ${
                      highContrastMode
                        ? "border-white text-white bg-black"
                        : "border-jungle/30 text-slate-700 hover:border-jungle/50 focus:border-jungle/60 hover:shadow-lg"
                    }`}
                    aria-label="Search jungle categories"
                  />
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-jungle/60" />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 hover:bg-jungle/10 rounded-full transition-all duration-200"
                      aria-label="Clear search"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced filters section (search is now integrated in header) */}
      <div className="space-y-4 px-4 md:px-0">
        {/* Additional filters for desktop when search is active */}
        {searchTerm && (
          <div className="hidden md:block">
            <div className="text-center mb-4">
              <p className={`text-lg font-medium ${
                highContrastMode ? "text-white" : "text-slate-600"
              }`}>
                Found {categories.length} jungle paths matching "{searchTerm}"
              </p>
            </div>
          </div>
        )}

        {/* Placeholder to maintain original search structure for mobile fallback */}
        <div className="hidden">
          <Input
            type="text"
            placeholder="🌿 Explore jungle categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-12 pr-12 py-3 rounded-full border-2 focus:ring-2 focus:ring-jungle/50 ${
              highContrastMode
                ? "bg-black text-white border-white"
                : "border-educational-blue/20 focus:border-educational-blue bg-white/80 backdrop-blur-sm"
            }`}
            aria-label="Search categories"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-educational-blue" />
          {searchTerm && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSearchTerm("");
                searchInputRef.current?.focus();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-educational-blue/10"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Advanced filters */}
        {showAdvanced && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 ${
                highContrastMode
                  ? "border-white text-white hover:bg-white hover:text-black"
                  : ""
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </Button>

            {showFilters && (
              <div className="flex gap-2 flex-wrap justify-center">
                {["all", "beginner", "intermediate", "advanced"].map(
                  (difficulty) => (
                    <Button
                      key={difficulty}
                      size="sm"
                      variant={
                        selectedDifficulty === difficulty
                          ? "default"
                          : "outline"
                      }
                      onClick={() => setSelectedDifficulty(difficulty)}
                      className={`capitalize ${
                        selectedDifficulty === difficulty
                          ? "bg-educational-blue text-white"
                          : highContrastMode
                            ? "border-white text-white hover:bg-white hover:text-black"
                            : ""
                      }`}
                    >
                      {difficulty === "all" ? "All Levels" : difficulty}
                    </Button>
                  ),
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setViewMode(viewMode === "grid" ? "list" : "grid")
                  }
                  className={
                    highContrastMode
                      ? "border-white text-white hover:bg-white hover:text-black"
                      : ""
                  }
                  aria-label={`Switch to ${viewMode === "grid" ? "list" : "grid"} view`}
                >
                  {viewMode === "grid" ? "📋" : "📱"}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Search results summary */}
        {searchTerm && (
          <div className="text-center">
            <p
              className={`text-sm ${highContrastMode ? "text-white" : "text-slate-600"}`}
            >
              Found {categories.length} categories matching "{searchTerm}"
              {categories.length === 0 && (
                <span className="block mt-2">
                  Try searching for "animals", "colors", or "food"
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Encouragement popup */}
      {showEncouragement && showGameification && !reduceMotion && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <Card
            className={`shadow-2xl ${
              highContrastMode
                ? "bg-black text-white border-white"
                : "bg-gradient-to-r from-educational-pink to-educational-purple text-white"
            }`}
          >
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 mx-auto mb-2 fill-current" />
              <p className="text-sm font-semibold">
                You're doing amazing! Keep exploring! 🌟
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced categories display */}
      <div
        className={`px-4 md:px-0 ${
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            : "space-y-4"
        }`}
      >
        {categories.map((category, index) => {
          const isRecommended = userInterests.some(
            (interest) =>
              category.id.includes(interest) ||
              category.name.toLowerCase().includes(interest.toLowerCase()),
          );

          const isSelected = selectedCategory === category.id;

          return (
            <Card
              key={category.id}
              className={`transition-all duration-300 overflow-hidden category-card-mobile ${
                lockedCategory && lockedCategory !== category.id
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              } ${
                !reduceMotion &&
                (!lockedCategory || lockedCategory === category.id)
                  ? "hover:shadow-lg transform hover:scale-102"
                  : ""
              } ${
                isSelected
                  ? `ring-3 shadow-xl scale-102 ${
                      highContrastMode
                        ? "ring-white bg-black text-white"
                        : "ring-educational-blue bg-gradient-to-br from-blue-50 to-purple-50"
                    }`
                  : lockedCategory && lockedCategory !== category.id
                    ? "bg-gray-100 border-gray-200"
                    : highContrastMode
                      ? "bg-black text-white border-white hover:bg-gray-900"
                      : "hover:shadow-lg"
              }`}
              style={{
                animationDelay: !reduceMotion ? `${index * 50}ms` : "0ms",
              }}
              onClick={() => handleCategoryClick(category.id)}
              onTouchStart={() => {
                if (!lockedCategory || lockedCategory === category.id) {
                  handleCategoryHover(category.id);
                }
              }}
              onMouseEnter={() => {
                if (!lockedCategory || lockedCategory === category.id) {
                  handleCategoryHover(category.id);
                }
              }}
              onMouseLeave={() => setHoveredCategory(null)}
              role="button"
              tabIndex={0}
              aria-label={`${
                lockedCategory && lockedCategory !== category.id
                  ? `${category.name} category is locked. Complete current category first.`
                  : lockedCategory === category.id
                    ? `${category.name} category is in progress. Continue learning.`
                    : `Select ${category.name} category with ${category.wordCount} words. Estimated time: ${category.estimatedTime}.`
              }`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCategoryClick(category.id);
                }
              }}
            >
              <CardContent className="p-0">
                {/* Enhanced header with better mobile touch targets */}
                <div
                  className={`bg-gradient-to-r ${category.gradient} p-4 md:p-6 text-white text-center relative overflow-hidden ${
                    highContrastMode ? "bg-gray-800" : ""
                  }`}
                >
                  {/* Enhanced badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {lockedCategory === category.id && (
                      <Badge className="bg-orange-400 text-orange-900 text-xs px-2 py-1 animate-pulse flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        In Progress
                      </Badge>
                    )}
                    {lockedCategory && lockedCategory !== category.id && (
                      <Badge className="bg-gray-400 text-gray-700 text-xs px-2 py-1 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Locked
                      </Badge>
                    )}
                    {isRecommended && !lockedCategory && (
                      <Badge className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 animate-pulse">
                        ⭐ For You
                      </Badge>
                    )}
                    <Badge
                      className={`text-xs px-2 py-1 ${getDifficultyBadgeColor(category.difficulty)}`}
                    >
                      {category.difficulty}
                    </Badge>
                  </div>

                  {/* Enhanced selection effects */}
                  {(hoveredCategory === category.id || isSelected) &&
                    !reduceMotion && (
                      <>
                        <Sparkles className="absolute top-2 right-2 w-5 h-5 text-yellow-300 animate-spin" />
                        <Star className="absolute bottom-2 left-2 w-4 h-4 text-yellow-300 animate-pulse" />
                        <Heart className="absolute bottom-2 right-2 w-4 h-4 text-pink-300 animate-bounce" />
                      </>
                    )}

                  {/* Enhanced icon with better animations */}
                  <div
                    className={`text-4xl md:text-6xl mb-3 transition-transform duration-300 ${
                      !reduceMotion &&
                      (hoveredCategory === category.id || isSelected)
                        ? "animate-gentle-bounce scale-110"
                        : ""
                    }`}
                  >
                    {category.icon}
                  </div>

                  <h3 className="text-lg md:text-xl font-bold mb-2">
                    {category.name}
                  </h3>

                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <Badge className="bg-white/20 border-white/30 text-white text-xs">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {category.wordCount} words
                    </Badge>
                    <Badge className="bg-white/20 border-white/30 text-white text-xs">
                      ⏱️ {category.estimatedTime}
                    </Badge>
                  </div>

                  {/* Enhanced selection indicator */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-white/10 animate-pulse">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Crown className="w-10 h-10 md:w-12 md:h-12 text-yellow-300 animate-bounce" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced content */}
                <div className="p-4 md:p-6 space-y-4">
                  <p
                    className={`text-sm leading-relaxed transition-colors duration-300 ${
                      isSelected
                        ? "text-educational-blue font-semibold"
                        : highContrastMode
                          ? "text-white"
                          : "text-slate-600"
                    }`}
                  >
                    {category.description}
                  </p>

                  {/* Enhanced fun fact display */}
                  {(hoveredCategory === category.id || isSelected) && (
                    <div
                      className={`rounded-lg p-3 animate-fade-in ${
                        highContrastMode
                          ? "bg-gray-800 border border-white"
                          : "bg-gradient-to-r from-educational-blue/10 to-educational-purple/10"
                      }`}
                    >
                      <p
                        className={`text-sm font-semibold ${
                          highContrastMode
                            ? "text-white"
                            : "text-educational-purple"
                        }`}
                      >
                        💡 {category.funFact}
                      </p>
                    </div>
                  )}

                  {/* Enhanced difficulty visualization */}
                  <div className="space-y-2">
                    <div
                      className={`flex justify-between text-xs ${
                        highContrastMode ? "text-white" : "text-slate-500"
                      }`}
                    >
                      <span>Difficulty Mix</span>
                      <span>{category.wordCount} total</span>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1 space-y-1">
                        <div className="w-full bg-green-100 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-700"
                            style={{
                              width: `${category.wordCount > 0 ? (category.difficultyBreakdown.easy / category.wordCount) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-center">
                          <span className="text-green-600 font-medium text-xs">
                            🌟 {category.difficultyBreakdown.easy}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="w-full bg-orange-100 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all duration-700"
                            style={{
                              width: `${category.wordCount > 0 ? (category.difficultyBreakdown.medium / category.wordCount) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-center">
                          <span className="text-orange-600 font-medium text-xs">
                            ⭐ {category.difficultyBreakdown.medium}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="w-full bg-red-100 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full transition-all duration-700"
                            style={{
                              width: `${category.wordCount > 0 ? (category.difficultyBreakdown.hard / category.wordCount) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-center">
                          <span className="text-red-600 font-medium text-xs">
                            🔥 {category.difficultyBreakdown.hard}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced selection indicator */}
                  {isSelected && (
                    <div className="flex items-center justify-center">
                      <Badge
                        className={`animate-pulse px-4 py-2 ${
                          highContrastMode
                            ? "bg-white text-black"
                            : "bg-gradient-to-r from-educational-green to-educational-blue text-white"
                        }`}
                      >
                        <Star className="w-4 h-4 mr-1 animate-spin" />
                        <span className="text-sm">✓ Selected!</span>
                        <Sparkles className="w-4 h-4 ml-1 animate-bounce" />
                      </Badge>
                    </div>
                  )}

                  {/* Enhanced hover encouragement */}
                  {hoveredCategory === category.id && !isSelected && (
                    <div className="flex items-center justify-center">
                      <Badge
                        className={`animate-pulse text-xs px-3 py-1 ${
                          highContrastMode
                            ? "bg-gray-700 text-white border border-white"
                            : "bg-educational-purple/20 text-educational-purple border border-educational-purple/30"
                        }`}
                      >
                        🎯 Tap to explore!
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enhanced empty state */}
      {categories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3
            className={`text-lg font-semibold mb-2 ${highContrastMode ? "text-white" : ""}`}
          >
            No categories found
          </h3>
          <p
            className={`mb-4 px-4 ${highContrastMode ? "text-white" : "text-slate-600"}`}
          >
            Try searching for something like "animals", "colors", or "food"
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setSelectedDifficulty("all");
              searchInputRef.current?.focus();
            }}
            className={`${
              highContrastMode
                ? "border-white text-white hover:bg-white hover:text-black"
                : "text-educational-blue border-educational-blue hover:bg-educational-blue/10"
            }`}
          >
            Clear all filters
          </Button>
        </div>
      )}

      {/* Enhanced mobile stats */}
      <div className="md:hidden px-4">
        <Card
          className={`border ${
            highContrastMode
              ? "bg-black text-white border-white"
              : "bg-gradient-to-r from-educational-blue/5 to-educational-purple/5 border-educational-blue/20"
          }`}
        >
          <CardContent className="p-4">
            <h3
              className={`font-semibold mb-3 text-center ${
                highContrastMode ? "text-white" : "text-slate-800"
              }`}
            >
              📊 Your Learning Stats
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-educational-blue">
                  {categories.find((c) => c.id === selectedCategory)
                    ?.wordCount || 0}
                </div>
                <div
                  className={`text-xs ${highContrastMode ? "text-white" : "text-slate-600"}`}
                >
                  Words Available
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-educational-green">
                  {categories.length}
                </div>
                <div
                  className={`text-xs ${highContrastMode ? "text-white" : "text-slate-600"}`}
                >
                  Categories
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-educational-purple">
                  {selectedCategory
                    ? categories.find((c) => c.id === selectedCategory)
                        ?.estimatedTime || "5-15"
                    : "5-15"}
                </div>
                <div
                  className={`text-xs ${highContrastMode ? "text-white" : "text-slate-600"}`}
                >
                  Minutes
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced call to action */}
      <div className="text-center px-4 md:px-0">
        <div className="md:hidden mb-4">
          <Card
            className={`border ${
              highContrastMode
                ? "bg-black text-white border-white"
                : "bg-gradient-to-r from-educational-green/10 to-educational-blue/10 border-educational-blue/20"
            }`}
          >
            <CardContent className="p-4">
              <div
                className={`flex items-center justify-center gap-2 mb-3 ${
                  highContrastMode ? "text-white" : "text-educational-blue"
                }`}
              >
                <Heart className="w-5 h-5 fill-current animate-gentle-bounce" />
                <span className="font-semibold text-sm">
                  Ready to start learning?
                </span>
                <Heart className="w-5 h-5 fill-current animate-gentle-bounce" />
              </div>
              {selectedCategory && selectedCategory !== "all" && (
                <div
                  className={`text-xs mb-3 ${
                    highContrastMode ? "text-white" : "text-slate-600"
                  }`}
                >
                  You selected:{" "}
                  <span
                    className={`font-semibold ${
                      highContrastMode ? "text-white" : "text-educational-blue"
                    }`}
                  >
                    {categories.find((c) => c.id === selectedCategory)?.name}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Button
          size="lg"
          onClick={() => {
            if ("vibrate" in navigator) {
              navigator.vibrate([100, 50, 100]);
            }
            onSelectCategory(selectedCategory);
          }}
          disabled={!selectedCategory || selectedCategory === ""}
          className={`text-lg md:text-xl px-8 md:px-12 py-3 md:py-4 rounded-full font-bold transform transition-all duration-300 shadow-2xl relative overflow-hidden w-full md:w-auto ${
            !reduceMotion ? "md:hover:scale-110" : ""
          } ${
            highContrastMode
              ? "bg-white text-black hover:bg-gray-100"
              : "bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink text-white hover:from-educational-blue/90 hover:via-educational-purple/90 hover:to-educational-pink/90"
          }`}
          aria-label={
            selectedCategory
              ? `Start learning ${categories.find((c) => c.id === selectedCategory)?.name}`
              : "Select a category first"
          }
        >
          <span className="relative z-10 flex items-center gap-2">
            {!reduceMotion && <Sparkles className="w-6 h-6 animate-spin" />}
            🚀{" "}
            {selectedCategory
              ? `Start Learning ${categories.find((c) => c.id === selectedCategory)?.name}!`
              : "Select a Category First!"}{" "}
            🚀
            {!reduceMotion && <Star className="w-6 h-6 animate-pulse" />}
          </span>

          {!reduceMotion && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
          )}
        </Button>

        <p
          className={`text-xs md:text-sm mt-4 ${
            !reduceMotion ? "animate-pulse" : ""
          } ${highContrastMode ? "text-white" : "text-slate-500"}`}
        >
          ✨ Choose a category above to begin your vocabulary journey! ✨
        </p>
      </div>
    </div>
  );
}
