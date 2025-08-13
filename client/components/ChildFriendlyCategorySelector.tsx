import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
    id: "all",
    name: "All Words",
    icon: "📚",
    color: "bg-slate-500",
    gradient: "from-slate-400 to-slate-600",
    wordCount: wordsDatabase.length,
    description: "Explore our complete magical vocabulary collection!",
    funFact: "Did you know we have over 100 amazing words to discover?",
    difficultyBreakdown: {
      easy: wordsDatabase.filter((w) => w.difficulty === "easy").length,
      medium: wordsDatabase.filter((w) => w.difficulty === "medium").length,
      hard: wordsDatabase.filter((w) => w.difficulty === "hard").length,
    },
  },
  {
    id: "animals",
    name: "Animals",
    icon: "🦋",
    color: "bg-educational-blue",
    gradient: "from-blue-400 to-blue-600",
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
    color: "bg-educational-green",
    gradient: "from-green-400 to-green-600",
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
    color: "bg-educational-purple",
    gradient: "from-purple-400 to-purple-600",
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
    color: "bg-educational-orange",
    gradient: "from-orange-400 to-orange-600",
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
    icon: "⭐",
    color: "bg-indigo-600",
    gradient: "from-indigo-500 to-indigo-700",
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
    color: "bg-green-500",
    gradient: "from-green-400 to-green-600",
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
    color: "bg-purple-500",
    gradient: "from-purple-400 to-purple-600",
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
    color: "bg-educational-pink",
    gradient: "from-pink-400 to-pink-600",
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
    color: "bg-blue-500",
    gradient: "from-blue-400 to-blue-600",
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
    color: "bg-educational-yellow",
    gradient: "from-yellow-400 to-yellow-600",
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
    color: "bg-educational-purple",
    gradient: "from-purple-400 to-purple-600",
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
    color: "bg-yellow-500",
    gradient: "from-yellow-400 to-yellow-600",
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
    color: "bg-slate-600",
    gradient: "from-slate-500 to-slate-700",
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
    color: "bg-red-500",
    gradient: "from-red-400 to-red-600",
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
    color: "bg-cyan-500",
    gradient: "from-cyan-400 to-cyan-600",
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
].filter((category) => category.wordCount > 0 || category.id === "all");

export function ChildFriendlyCategorySelector({
  selectedCategory = "all",
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

    // Show encouragement periodically
    const encouragementTimer = setInterval(() => {
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 3000);
    }, 10000);

    return () => clearInterval(encouragementTimer);
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    audioService.playCheerSound();
    onSelectCategory(categoryId);
  };

  const handleCategoryHover = (categoryId: string) => {
    setHoveredCategory(categoryId);
    audioService.playWhooshSound();
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
  const filteredCategories = getRecommendedCategories().filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = searchTerm ? filteredCategories : getRecommendedCategories();

  return (
    <div className="space-y-8 relative">
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
        <div className="md:hidden mb-4">
          <div className="bg-gradient-to-r from-educational-blue/10 to-educational-purple/10 rounded-2xl p-4 border border-educational-blue/20">
            <h2 className="text-lg font-bold text-slate-800 mb-2 bg-gradient-to-r from-educational-blue to-educational-purple bg-clip-text text-transparent">
              🌟 Choose Your Adventure! 🌟
            </h2>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              {getPersonalizedMessage()}
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              <Badge className="bg-educational-green text-white px-3 py-1 text-xs animate-pulse">
                📚 {wordsDatabase.length} Words
              </Badge>
              <Badge className="bg-educational-blue text-white px-3 py-1 text-xs animate-pulse delay-100">
                🎯 {categories.length - 1} Topics
              </Badge>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <h2 className="text-2xl font-bold text-slate-800 mb-2 bg-gradient-to-r from-educational-blue to-educational-purple bg-clip-text text-transparent">
            🌟 Choose Your Learning Adventure! 🌟
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-2">
            {getPersonalizedMessage()}
          </p>
          <div className="flex justify-center gap-2 mb-4 flex-wrap">
            <Badge className="bg-educational-green text-white px-3 py-1 text-sm animate-pulse">
              📚 {wordsDatabase.length} Amazing Words
            </Badge>
            <Badge className="bg-educational-blue text-white px-3 py-1 text-sm animate-pulse delay-100">
              🎯 {categories.length - 1} Fun Categories
            </Badge>
            <Badge className="bg-educational-purple text-white px-3 py-1 text-sm animate-pulse delay-200">
              ⭐ 3 Difficulty Levels
            </Badge>
          </div>
        </div>
      </div>

      {/* Encouragement Popup */}
      {showEncouragement && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <Card className="bg-gradient-to-r from-educational-pink to-educational-purple text-white shadow-2xl">
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 mx-auto mb-2 fill-current" />
              <p className="text-sm font-semibold">
                You're doing great! Keep exploring! 🌟
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mobile Search and Quick Categories */}
      <div className="md:hidden mb-6 px-2">
        {/* Mobile Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 pr-12 rounded-full border-2 border-educational-blue/20 focus:border-educational-blue focus:outline-none bg-white/80 backdrop-blur-sm text-sm"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-educational-blue">
              🔍
            </div>
            {searchTerm && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-educational-blue/10"
              >
                ✕
              </Button>
            )}
          </div>
          {searchTerm && (
            <div className="mt-2 text-xs text-slate-600 text-center">
              Found {categories.length} categories matching "{searchTerm}"
            </div>
          )}
        </div>

        {/* Quick Categories Bar */}
        {!searchTerm && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">🚀 Quick Select</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {enrichedCategories.slice(0, 6).map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryClick(category.id)}
                  className={`flex-shrink-0 h-16 w-16 flex-col gap-1 ${
                    selectedCategory === category.id
                      ? "bg-educational-blue hover:bg-educational-blue/90 text-white border-2 border-educational-blue"
                      : "hover:bg-educational-blue/10 hover:text-educational-blue hover:border-educational-blue"
                  }`}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-xs font-medium text-center leading-tight">{category.name.split(' ')[0]}</span>
                </Button>
              ))}
            </div>
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
              className={`cursor-pointer transition-all duration-300 overflow-hidden ${
                selectedCategory === category.id
                  ? "ring-3 ring-educational-blue shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 scale-[1.02] md:scale-105"
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
                      <Badge className="bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 md:px-2 md:py-1 animate-pulse">
                        ⭐ For You
                      </Badge>
                    </div>
                  )}

                  {/* Mobile touch effects */}
                  {(hoveredCategory === category.id || selectedCategory === category.id) && (
                    <>
                      <Sparkles className="absolute top-1 right-1 md:top-2 md:right-2 w-4 h-4 md:w-6 md:h-6 text-yellow-300 animate-spin" />
                      <Star className="absolute bottom-1 left-1 md:bottom-2 md:left-2 w-3 h-3 md:w-5 md:h-5 text-yellow-300 animate-pulse" />
                      <Heart className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-3 h-3 md:w-5 md:h-5 text-pink-300 animate-bounce" />
                    </>
                  )}

                  <div
                    className={`text-3xl md:text-6xl mb-2 md:mb-3 transition-transform duration-300 ${
                      hoveredCategory === category.id || selectedCategory === category.id
                        ? "animate-gentle-bounce scale-110"
                        : ""
                    }`}
                  >
                    {category.icon}
                  </div>
                  <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2">
                    {category.name}
                  </h3>
                  <Badge className="bg-white/20 border-white/30 text-white text-xs">
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
                        ? "text-educational-blue font-semibold"
                        : "text-slate-600"
                    }`}
                  >
                    {category.description}
                  </p>

                  {/* Mobile Fun Fact - Show for selected */}
                  {(hoveredCategory === category.id || selectedCategory === category.id) && (
                    <div className="bg-gradient-to-r from-educational-blue/10 to-educational-purple/10 rounded-lg p-2 md:p-3 animate-fade-in">
                      <p className="text-xs md:text-sm text-educational-purple font-semibold">
                        💡 {category.funFact}
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
                      <Badge className="bg-gradient-to-r from-educational-green to-educational-blue text-white animate-pulse px-3 py-1.5 md:px-4 md:py-2">
                        <Star className="w-3 h-3 md:w-4 md:h-4 mr-1 animate-spin" />
                        <span className="text-xs md:text-sm">✓ Selected!</span>
                        <Sparkles className="w-3 h-3 md:w-4 md:h-4 ml-1 animate-bounce" />
                      </Badge>
                    </div>
                  )}

                  {/* Mobile Touch Encouragement */}
                  {hoveredCategory === category.id && selectedCategory !== category.id && (
                    <div className="flex items-center justify-center">
                      <Badge className="bg-educational-purple/20 text-educational-purple border border-educational-purple/30 animate-pulse text-xs px-2 py-1">
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

      {/* Mobile Category Stats */}
      <div className="md:hidden mt-6 px-2">
        <Card className="bg-gradient-to-r from-educational-blue/5 to-educational-purple/5 border-educational-blue/20">
          <CardContent className="p-4">
            <h3 className="font-semibold text-slate-800 mb-3 text-center">📊 Your Learning Stats</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-educational-blue">
                  {categories.find(c => c.id === selectedCategory)?.wordCount || 0}
                </div>
                <div className="text-xs text-slate-600">Words Available</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-educational-green">
                  {categories.length - 1}
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
                  You selected: <span className="font-semibold text-educational-blue">
                    {categories.find(c => c.id === selectedCategory)?.name}
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
                Ready for your Wordy's Adventure?
              </span>
              <Heart className="w-5 h-5 fill-current animate-gentle-bounce" />
            </div>
          </div>
        </div>

        <Button
          size="lg"
          onClick={() => {
            audioService.playCheerSound();
            onSelectCategory(selectedCategory);
          }}
          disabled={!selectedCategory || selectedCategory === ""}
          className="bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink text-white hover:from-educational-blue/90 hover:via-educational-purple/90 hover:to-educational-pink/90 text-lg md:text-xl px-8 md:px-12 py-3 md:py-4 rounded-full font-bold transform md:hover:scale-110 transition-all duration-300 shadow-2xl relative overflow-hidden w-full md:w-auto"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Sparkles className="w-6 h-6 animate-spin" />
            🚀 Start Learning{" "}
            {categories.find((c) => c.id === selectedCategory)?.name}! 🚀
            <Star className="w-6 h-6 animate-pulse" />
          </span>

          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
        </Button>

        <p className="text-xs md:text-sm text-slate-500 mt-4 animate-pulse">
          ✨ Choose a category above to begin your vocabulary journey! ✨
        </p>
      </div>

      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed bottom-20 right-4 z-50">
        {selectedCategory !== "all" && (
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => {
                const selectedCat = categories.find(c => c.id === selectedCategory);
                if (selectedCat) {
                  audioService.playCheerSound();
                }
              }}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-educational-green to-educational-blue hover:from-educational-green/90 hover:to-educational-blue/90 shadow-lg"
            >
              <span className="text-2xl">
                {categories.find(c => c.id === selectedCategory)?.icon || "🚀"}
              </span>
            </Button>
            <div className="text-xs text-center text-white bg-black/70 rounded px-2 py-1">
              {categories.find(c => c.id === selectedCategory)?.name}
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
            const allButton = document.querySelector('[data-category="all"]') as HTMLElement;
            allButton?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
          className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border-2 border-educational-blue/20 hover:bg-educational-blue/10"
        >
          <span className="text-lg">🎯</span>
        </Button>
      </div>
    </div>
  );
}
