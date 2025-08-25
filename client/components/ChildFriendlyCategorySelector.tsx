import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Sparkles, Star, Heart, Zap, Crown, Gift } from "lucide-react";
import { audioService } from "@/lib/audioService";
import {
  getAllCategories,
  getWordsByCategory,
  wordsDatabase,
} from "@/data/wordsDatabase";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  wordCount: number;
  description: string;
  gradient: string;
  funFact: string;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
}

interface ChildFriendlyCategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  userInterests?: string[];
}

const enrichedCategories: Category[] = [
  {
    id: "animals",
    name: "Animals",
    icon: "🦋",
    color: "bg-jungle",
    gradient: "from-jungle to-jungle-light",
    wordCount: getWordsByCategory("animals").length,
    description: "Meet amazing creatures from around the world!",
    funFact: "Some animals can taste with their feet!",
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
    color: "bg-jungle-light",
    gradient: "from-jungle-light to-jungle",
    wordCount: getWordsByCategory("nature").length,
    description: "Explore the magical wonders of our natural world!",
    funFact: "Trees can live for thousands of years!",
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
    id: "science",
    name: "Science",
    icon: "🔬",
    color: "bg-profile-purple",
    gradient: "from-profile-purple to-playful-purple",
    wordCount: getWordsByCategory("science").length,
    description: "Discover amazing scientific wonders and cool experiments!",
    funFact: "Scientists discover new things every day!",
    difficultyBreakdown: {
      easy: getWordsByCategory("science").filter((w) => w.difficulty === "easy")
        .length,
      medium: getWordsByCategory("science").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("science").filter((w) => w.difficulty === "hard")
        .length,
    },
  },
  {
    id: "food",
    name: "Food",
    icon: "🍎",
    color: "bg-bright-orange",
    gradient: "from-bright-orange to-sunshine",
    wordCount: getWordsByCategory("food").length,
    description: "Discover delicious treats and healthy foods!",
    funFact: "Some fruits change color as they ripen!",
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
    id: "space",
    name: "Space",
    icon: "���",
    color: "bg-navy",
    gradient: "from-navy to-sky",
    wordCount: getWordsByCategory("space").length,
    description: "Blast off and explore the mysteries of the cosmos!",
    funFact: "There are more stars than grains of sand on Earth!",
    difficultyBreakdown: {
      easy: getWordsByCategory("space").filter((w) => w.difficulty === "easy")
        .length,
      medium: getWordsByCategory("space").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("space").filter((w) => w.difficulty === "hard")
        .length,
    },
  },
  {
    id: "sports",
    name: "Sports",
    icon: "⚽",
    color: "bg-jungle",
    gradient: "from-jungle to-jungle-dark",
    wordCount: getWordsByCategory("sports").length,
    description: "Get active with games, sports, and fun activities!",
    funFact: "Playing sports helps your brain grow stronger!",
    difficultyBreakdown: {
      easy: getWordsByCategory("sports").filter((w) => w.difficulty === "easy")
        .length,
      medium: getWordsByCategory("sports").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("sports").filter((w) => w.difficulty === "hard")
        .length,
    },
  },
  {
    id: "music",
    name: "Music",
    icon: "🎵",
    color: "bg-playful-purple",
    gradient: "from-playful-purple to-profile-purple",
    wordCount: getWordsByCategory("music").length,
    description: "Make beautiful sounds with instruments and melodies!",
    funFact: "Music can make you feel happy and excited!",
    difficultyBreakdown: {
      easy: getWordsByCategory("music").filter((w) => w.difficulty === "easy")
        .length,
      medium: getWordsByCategory("music").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("music").filter((w) => w.difficulty === "hard")
        .length,
    },
  },
  {
    id: "body",
    name: "Body Parts",
    icon: "👤",
    color: "bg-coral-red",
    gradient: "from-coral-red to-bright-orange",
    wordCount: getWordsByCategory("body").length,
    description: "Learn about your amazing body and all its parts!",
    funFact: "Your body has 206 bones when you're an adult!",
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
    id: "clothes",
    name: "Clothes",
    icon: "👕",
    color: "bg-sky",
    gradient: "from-sky to-sky-dark",
    wordCount: getWordsByCategory("clothes").length,
    description: "Discover different types of clothing and fashion!",
    funFact: "The first clothing was made from animal skins!",
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
  {
    id: "family",
    name: "Family",
    icon: "👪",
    color: "bg-sunshine",
    gradient: "from-sunshine to-sunshine-dark",
    wordCount: getWordsByCategory("family").length,
    description: "Learn about family members who love and care for you!",
    funFact: "Family is the most important thing in life!",
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
    color: "bg-playful-purple",
    gradient: "from-playful-purple to-profile-purple",
    wordCount: getWordsByCategory("feelings").length,
    description: "Understand different emotions and how you feel!",
    funFact: "It's healthy to talk about your feelings!",
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
    id: "greetings",
    name: "Greetings",
    icon: "👋",
    color: "bg-sunshine",
    gradient: "from-sunshine-light to-sunshine",
    wordCount: getWordsByCategory("greetings").length,
    description: "Learn friendly ways to say hello and goodbye!",
    funFact: "Greeting people politely makes them smile!",
    difficultyBreakdown: {
      easy: getWordsByCategory("greetings").filter(
        (w) => w.difficulty === "easy",
      ).length,
      medium: getWordsByCategory("greetings").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("greetings").filter(
        (w) => w.difficulty === "hard",
      ).length,
    },
  },
  {
    id: "technology",
    name: "Technology",
    icon: "🤖",
    color: "bg-navy",
    gradient: "from-navy to-profile-purple",
    wordCount: getWordsByCategory("technology").length,
    description: "Discover amazing gadgets and modern inventions!",
    funFact: "Technology makes our lives easier and more fun!",
    difficultyBreakdown: {
      easy: getWordsByCategory("technology").filter(
        (w) => w.difficulty === "easy",
      ).length,
      medium: getWordsByCategory("technology").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("technology").filter(
        (w) => w.difficulty === "hard",
      ).length,
    },
  },
  {
    id: "transportation",
    name: "Transportation",
    icon: "🚗",
    color: "bg-coral-red",
    gradient: "from-coral-red to-bright-orange",
    wordCount: getWordsByCategory("transportation").length,
    description: "Explore different ways to travel and move around!",
    funFact: "Transportation helps us go to amazing places!",
    difficultyBreakdown: {
      easy: getWordsByCategory("transportation").filter(
        (w) => w.difficulty === "easy",
      ).length,
      medium: getWordsByCategory("transportation").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("transportation").filter(
        (w) => w.difficulty === "hard",
      ).length,
    },
  },
  {
    id: "weather",
    name: "Weather",
    icon: "🌤️",
    color: "bg-sky",
    gradient: "from-sky-light to-sky",
    wordCount: getWordsByCategory("weather").length,
    description: "Learn about different weather and sky conditions!",
    funFact: "Weather affects how we feel and what we do!",
    difficultyBreakdown: {
      easy: getWordsByCategory("weather").filter((w) => w.difficulty === "easy")
        .length,
      medium: getWordsByCategory("weather").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("weather").filter((w) => w.difficulty === "hard")
        .length,
    },
  },
  {
    id: "colors",
    name: "Colors",
    icon: "🌈",
    color: "bg-rainbow",
    gradient: "from-coral-red via-sunshine to-jungle",
    wordCount: getWordsByCategory("colors").length,
    description: "Discover beautiful colors that make the world bright!",
    funFact: "Colors can change how we feel and think!",
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
    color: "bg-sky",
    gradient: "from-sky to-navy",
    wordCount: getWordsByCategory("numbers").length,
    description: "Learn to count and explore the magic of numbers!",
    funFact: "Numbers help us understand the world around us!",
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
    id: "objects",
    name: "Objects",
    icon: "🧸",
    color: "bg-profile-purple",
    gradient: "from-profile-purple to-playful-purple",
    wordCount: getWordsByCategory("objects").length,
    description: "Explore everyday objects and fun things around you!",
    funFact: "Objects tell stories about how people live!",
    difficultyBreakdown: {
      easy: getWordsByCategory("objects").filter((w) => w.difficulty === "easy")
        .length,
      medium: getWordsByCategory("objects").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("objects").filter((w) => w.difficulty === "hard")
        .length,
    },
  },
].filter((category) => category.wordCount > 0);

export function ChildFriendlyCategorySelector({
  selectedCategory,
  onSelectCategory,
  userInterests = [],
}: ChildFriendlyCategorySelectorProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [floatingElements, setFloatingElements] = useState<
    Array<{ id: string; emoji: string; x: number; y: number }>
  >([]);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Add floating animation elements
  useEffect(() => {
    const elements = [
      { id: "1", emoji: "🌟", x: 10, y: 10 },
      { id: "2", emoji: "✨", x: 90, y: 20 },
      { id: "3", emoji: "🎯", x: 15, y: 80 },
      { id: "4", emoji: "🚀", x: 85, y: 75 },
      { id: "5", emoji: "💫", x: 50, y: 5 },
      { id: "6", emoji: "🎪", x: 25, y: 45 },
    ];
    setFloatingElements(elements);

    // Encouragement popup disabled for better UX
    // const encouragementTimer = setInterval(() => {
    //   setShowEncouragement(true);
    //   setTimeout(() => setShowEncouragement(false), 3000);
    // }, 10000);
    // return () => clearInterval(encouragementTimer);
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    onSelectCategory(categoryId);
  };

  const handleCategoryHover = (categoryId: string) => {
    setHoveredCategory(categoryId);
  };

  const getPersonalizedMessage = () => {
    if (userInterests.length === 0)
      return "Choose your favorite topic to start learning!";

    const matchingCategories = enrichedCategories.filter((cat) =>
      userInterests.some(
        (interest) =>
          cat.id.includes(interest) ||
          cat.name.toLowerCase().includes(interest.toLowerCase()),
      ),
    );

    if (matchingCategories.length > 0) {
      return `I see you love ${matchingCategories[0].name.toLowerCase()}! That's awesome! 🌟`;
    }

    return "I've picked some special categories just for you! 💝";
  };

  const getRecommendedCategories = () => {
    if (userInterests.length === 0) return enrichedCategories;

    const recommended = enrichedCategories.filter((cat) =>
      userInterests.some(
        (interest) =>
          cat.id.includes(interest) ||
          cat.name.toLowerCase().includes(interest.toLowerCase()),
      ),
    );

    const others = enrichedCategories.filter(
      (cat) => !recommended.includes(cat),
    );
    return [...recommended, ...others];
  };

  // Filter categories based on search
  const filteredCategories = getRecommendedCategories().filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const categories = searchTerm
    ? filteredCategories
    : getRecommendedCategories();

  return (
    <div className="space-y-8 relative jungle-pattern-bg jungle-mobile-optimized">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute text-2xl animate-bounce opacity-20"
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

      {/* Enhanced Mobile Header */}
      <div className="text-center relative mt-2 md:mt-4 px-2 md:px-0">
        <div className="md:hidden mb-3">
          <div className="bg-gradient-to-r from-jungle/8 to-white/95 rounded-xl p-3 border border-jungle/15 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-slate-800 truncate">
                  🌿 Jungle Adventure Library! 🦎
                </h2>
                <p className="text-xs text-jungle/70 leading-tight">
                  Choose your favorite topic!
                </p>
              </div>
              <div className="flex gap-1.5 ml-2">
                <Badge className="bg-jungle text-white px-2 py-1 text-xs rounded-full">
                  🌳 {wordsDatabase.length}
                </Badge>
                <Badge className="bg-educational-blue text-white px-2 py-1 text-xs rounded-full">
                  🎯 {categories.length}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Optimized Header */}
        <div className="hidden md:block">
          <div className="rounded-2xl p-5 mb-6 border backdrop-blur-sm bg-gradient-to-r from-jungle to-sunshine border-jungle/15 shadow-lg">
            {/* New Layout: Title Left, Categories Middle, Stats Right */}
            <div className="flex items-center gap-6">
              {/* Left: Title & Subtitle */}
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-white mb-1 drop-shadow-md">
                  🌿 Welcome to the Jungle Adventure Library! 🦋
                </h1>
                <p className="text-sm text-white/90 drop-shadow-sm">
                  Choose your favorite topic to start learning!
                </p>
              </div>

              {/* Middle: Quick Categories Selection (Top 6 Essential) */}
              <div className="flex-1 min-w-0 max-w-md">
                <div className="relative">
                  {/* Gradient fade edges for better UX */}
                  <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-jungle to-transparent z-10 pointer-events-none"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-sunshine to-transparent z-10 pointer-events-none"></div>

                  <div className="flex gap-2 overflow-x-auto overflow-y-hidden py-2 px-1 scroll-smooth scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent hover:scrollbar-thumb-white/50 transition-colors">
                    {enrichedCategories.slice(0, 6).map((category, index) => (
                      <Button
                        key={category.id}
                        variant={
                          selectedCategory === category.id ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handleCategoryClick(category.id)}
                        className={`flex-shrink-0 h-18 w-18 flex-col gap-0.5 transition-all duration-200 ${
                          selectedCategory === category.id
                            ? "bg-white/25 hover:bg-white/35 text-white border-2 border-white/60 shadow-lg scale-110"
                            : "bg-white/15 hover:bg-white/25 text-white border border-white/40 hover:border-white/60 hover:scale-105"
                        }`}
                        style={{
                          animationDelay: `${index * 50}ms`
                        }}
                      >
                        <span className="text-2xl drop-shadow-sm">{category.icon}</span>
                        <span className="text-xs font-semibold text-center leading-tight drop-shadow-sm">
                          {category.name.split(" ")[0]}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Compact Stats */}
              <div className="flex flex-col gap-2">
                <Badge className="bg-white/20 text-white px-3 py-1 text-xs font-medium rounded-full shadow-sm hover:bg-white/30 transition-colors border border-white/30">
                  🌳 {wordsDatabase.length}
                </Badge>
                <Badge className="bg-white/20 text-white px-3 py-1 text-xs font-medium rounded-full shadow-sm hover:bg-white/30 transition-colors border border-white/30">
                  🎯 {categories.length}
                </Badge>
                <Badge className="bg-white/20 text-white px-3 py-1 text-xs font-medium rounded-full shadow-sm hover:bg-white/30 transition-colors border border-white/30">
                  ⭐ 3 Levels
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Encouragement Popup */}
      {showEncouragement && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <Card className="bg-gradient-to-r from-jungle to-sunshine text-white shadow-2xl">
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 mx-auto mb-2 fill-current" />
              <p className="text-sm font-semibold">
                Amazing jungle explorer! Keep discovering! 🌿🦋
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mobile Quick Categories - Search removed */}
      <div className="md:hidden mb-6 px-2">
        {/* Quick Categories Bar - All Categories */}
        {!searchTerm && (
          <div>
            <h3 className="text-sm font-semibold text-jungle-dark mb-3">
              🌿 Quick Jungle Paths - All Adventures 🦎
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
              {enrichedCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleCategoryClick(category.id)}
                  className={`flex-shrink-0 h-16 w-16 flex-col gap-1 jungle-mobile-button ${
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-jungle to-jungle-light hover:from-jungle-dark hover:to-jungle text-white border-2 border-jungle shadow-lg"
                      : "hover:bg-jungle/10 hover:text-jungle hover:border-jungle hover:shadow-md"
                  }`}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-xs font-medium text-center leading-tight">
                    {category.name.split(" ")[0]}
                  </span>
                </Button>
              ))}
            </div>
            <p className="text-xs text-jungle-dark/70 mt-1">
              🌳 Scroll right to explore all {enrichedCategories.length} jungle
              adventures
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Categories Grid with Mobile Optimization */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
        {categories.map((category, index) => {
          const isRecommended = userInterests.some(
            (interest) =>
              category.id.includes(interest) ||
              category.name.toLowerCase().includes(interest.toLowerCase()),
          );

          return (
            <Card
              key={category.id}
              className={`cursor-pointer jungle-card-hover overflow-hidden ${
                selectedCategory === category.id
                  ? "ring-3 ring-jungle shadow-xl bg-gradient-to-br from-jungle/5 to-sunshine/10 scale-[1.02] md:scale-105"
                  : "hover:shadow-lg hover:scale-[1.01] md:hover:scale-110 md:hover:-translate-y-1"
              }`}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
              onClick={() => handleCategoryClick(category.id)}
              onTouchStart={() => handleCategoryHover(category.id)}
              onMouseEnter={() => handleCategoryHover(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <CardContent className="p-0">
                {/* Mobile-optimized Header */}
                <div
                  className={`bg-gradient-to-r ${category.gradient} p-4 md:p-6 text-white text-center relative overflow-hidden`}
                >
                  {/* Mobile Recommended Badge */}
                  {isRecommended && (
                    <div className="absolute top-1 left-1 md:top-2 md:left-2">
                      <Badge className="bg-gradient-to-r from-sunshine to-bright-orange text-navy text-xs px-1.5 py-0.5 md:px-2 md:py-1 animate-pulse shadow-lg">
                        🌟 For You
                      </Badge>
                    </div>
                  )}

                  {/* Mobile touch effects */}
                  {(hoveredCategory === category.id ||
                    selectedCategory === category.id) && (
                    <>
                      <Sparkles className="absolute top-1 right-1 md:top-2 md:right-2 w-4 h-4 md:w-6 md:h-6 text-yellow-300 animate-spin" />
                      <Star className="absolute bottom-1 left-1 md:bottom-2 md:left-2 w-3 h-3 md:w-5 md:h-5 text-yellow-300 animate-pulse" />
                      <Heart className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-3 h-3 md:w-5 md:h-5 text-pink-300 animate-bounce" />
                    </>
                  )}

                  <div
                    className={`text-3xl md:text-6xl mb-2 md:mb-3 transition-transform duration-300 animate-jungle-sway ${
                      hoveredCategory === category.id ||
                      selectedCategory === category.id
                        ? "animate-jungle-bounce scale-110"
                        : ""
                    }`}
                  >
                    {category.icon}
                  </div>
                  <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2">
                    {category.name}
                  </h3>
                  <Badge className="bg-white/30 border-white/40 text-white text-xs shadow-lg backdrop-blur-sm">
                    <Zap className="w-3 h-3 mr-1" />
                    {category.wordCount} words
                  </Badge>

                  {/* Enhanced Selection Animation */}
                  {selectedCategory === category.id && (
                    <div className="absolute inset-0 bg-white/10 animate-pulse">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Crown className="w-8 h-8 md:w-12 md:h-12 text-yellow-300 animate-bounce" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile-optimized Content */}
                <div className="p-3 md:p-6 space-y-3 md:space-y-4">
                  <p
                    className={`text-xs md:text-sm leading-relaxed transition-colors duration-300 ${
                      selectedCategory === category.id
                        ? "text-jungle font-semibold"
                        : "text-slate-600"
                    }`}
                  >
                    {category.description}
                  </p>

                  {/* Mobile Fun Fact - Show for selected */}
                  {(hoveredCategory === category.id ||
                    selectedCategory === category.id) && (
                    <div className="bg-gradient-to-r from-jungle/10 to-sunshine/10 rounded-lg p-2 md:p-3 animate-fade-in border border-jungle/20">
                      <p className="text-xs md:text-sm text-jungle-dark font-semibold">
                        🌿 {category.funFact}
                      </p>
                    </div>
                  )}

                  {/* Simplified Mobile Difficulty Display */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Difficulty Mix</span>
                      <span>{category.wordCount} total</span>
                    </div>

                    {/* Mobile-first difficulty visualization */}
                    <div className="flex gap-1 md:gap-2">
                      <div className="flex-1 space-y-1">
                        <div className="w-full bg-green-100 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
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
                            className="bg-orange-500 h-2 rounded-full transition-all duration-500"
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
                            className="bg-red-500 h-2 rounded-full transition-all duration-500"
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

                  {/* Enhanced Mobile Selection Indicator */}
                  {selectedCategory === category.id && (
                    <div className="flex items-center justify-center">
                      <Badge className="bg-gradient-to-r from-jungle to-sunshine text-white animate-pulse px-3 py-1.5 md:px-4 md:py-2 shadow-lg">
                        <Star className="w-3 h-3 md:w-4 md:h-4 mr-1 animate-spin" />
                        <span className="text-xs md:text-sm">✓ Selected!</span>
                        <Sparkles className="w-3 h-3 md:w-4 md:h-4 ml-1 animate-bounce" />
                      </Badge>
                    </div>
                  )}

                  {/* Mobile Touch Encouragement */}
                  {hoveredCategory === category.id &&
                    selectedCategory !== category.id && (
                      <div className="flex items-center justify-center">
                        <Badge className="bg-jungle/10 text-jungle border border-jungle/30 animate-pulse text-xs px-2 py-1 shadow-md">
                          🌿 Tap to explore!
                        </Badge>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search Results Empty State */}
      {searchTerm && categories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">No categories found</h3>
          <p className="text-slate-600 mb-4 px-4">
            Try searching for something like "animals", "space", or "food"
          </p>
          <Button
            variant="outline"
            onClick={() => setSearchTerm("")}
            className="text-educational-blue border-educational-blue hover:bg-educational-blue/10"
          >
            Clear search
          </Button>
        </div>
      )}

      {/* Mobile Category Stats */}
      <div className="md:hidden mt-6 px-2">
        <Card className="bg-gradient-to-r from-educational-blue/5 to-educational-purple/5 border-educational-blue/20">
          <CardContent className="p-4">
            <h3 className="font-semibold text-slate-800 mb-3 text-center">
              📊 Your Learning Stats
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-educational-blue">
                  {categories.find((c) => c.id === selectedCategory)
                    ?.wordCount || 0}
                </div>
                <div className="text-xs text-slate-600">Words Available</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-educational-green">
                  {categories.length}
                </div>
                <div className="text-xs text-slate-600">Categories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-educational-purple">
                  3
                </div>
                <div className="text-xs text-slate-600">Difficulty Levels</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Call to Action */}
      <div className="text-center px-2 md:px-0">
        {/* Mobile CTA */}
        <div className="md:hidden">
          <Card className="bg-gradient-to-r from-educational-green/10 to-educational-blue/10 border-educational-blue/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 text-educational-blue mb-3">
                <Heart className="w-5 h-5 fill-current animate-gentle-bounce" />
                <span className="font-semibold text-sm">
                  Ready to start learning?
                </span>
                <Heart className="w-5 h-5 fill-current animate-gentle-bounce" />
              </div>
              {selectedCategory !== "all" && (
                <div className="text-xs text-slate-600 mb-3">
                  You selected:{" "}
                  <span className="font-semibold text-educational-blue">
                    {categories.find((c) => c.id === selectedCategory)?.name}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex justify-center mb-4">
          <div className="bg-white rounded-full p-4 shadow-lg">
            <div className="flex items-center gap-2 text-educational-blue">
              <Heart className="w-5 h-5 fill-current animate-gentle-bounce" />
              <span className="font-semibold">
                Ready for your learning adventure?
              </span>
              <Heart className="w-5 h-5 fill-current animate-gentle-bounce" />
            </div>
          </div>
        </div>

        <Button
          size="lg"
          onClick={() => {
            onSelectCategory(selectedCategory);
          }}
          disabled={!selectedCategory || selectedCategory === ""}
          className="jungle-button bg-gradient-to-r from-jungle via-sunshine to-bright-orange text-white hover:from-jungle-dark hover:via-sunshine-dark hover:to-coral-red text-lg md:text-xl px-8 md:px-12 py-3 md:py-4 rounded-full font-bold transform md:hover:scale-110 transition-all duration-300 shadow-2xl relative overflow-hidden w-full md:w-auto animate-jungle-pulse"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Sparkles className="w-6 h-6 animate-spin" />
            🌿{" "}
            {selectedCategory
              ? `Start Jungle Adventure: ${categories.find((c) => c.id === selectedCategory)?.name}!`
              : "Choose Your Jungle Path First!"}{" "}
            🦋
            <Star className="w-6 h-6 animate-pulse" />
          </span>

          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
        </Button>

        <p className="text-xs md:text-sm text-jungle-dark/70 mt-4 animate-pulse">
          🌳 Choose a jungle path above to begin your adventure! 🦋
        </p>
      </div>

      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed bottom-20 right-4 z-50">
        {selectedCategory !== "all" && (
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => {
                const selectedCat = categories.find(
                  (c) => c.id === selectedCategory,
                );
                if (selectedCat) {
                  // Category selected - sound removed
                }
              }}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-jungle to-sunshine hover:from-jungle-dark hover:to-sunshine-dark shadow-lg"
            >
              <span className="text-2xl">
                {categories.find((c) => c.id === selectedCategory)?.icon ||
                  "🌿"}
              </span>
            </Button>
            <div className="text-xs text-center text-white bg-black/70 rounded px-2 py-1">
              {categories.find((c) => c.id === selectedCategory)?.name}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Category Filter Modal Trigger */}
      <div className="md:hidden fixed bottom-32 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Could trigger a modal with category filters
            const allButton = document.querySelector(
              '[data-category="all"]',
            ) as HTMLElement;
            allButton?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
          className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border-2 border-jungle/20 hover:bg-jungle/10"
        >
          <span className="text-lg">🌳</span>
        </Button>
      </div>
    </div>
  );
}
