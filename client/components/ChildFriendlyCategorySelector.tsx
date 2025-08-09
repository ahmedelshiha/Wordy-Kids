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
      easy: getWordsByCategory("feelings").filter((w) => w.difficulty === "easy")
        .length,
      medium: getWordsByCategory("feelings").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("feelings").filter((w) => w.difficulty === "hard")
        .length,
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
      easy: getWordsByCategory("greetings").filter((w) => w.difficulty === "easy")
        .length,
      medium: getWordsByCategory("greetings").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("greetings").filter((w) => w.difficulty === "hard")
        .length,
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
      easy: getWordsByCategory("technology").filter((w) => w.difficulty === "easy")
        .length,
      medium: getWordsByCategory("technology").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("technology").filter((w) => w.difficulty === "hard")
        .length,
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
      easy: getWordsByCategory("transportation").filter((w) => w.difficulty === "easy")
        .length,
      medium: getWordsByCategory("transportation").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("transportation").filter((w) => w.difficulty === "hard")
        .length,
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

  const categories = getRecommendedCategories();

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

      {/* Header */}
      <div className="text-center relative">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink p-4 rounded-full animate-pulse">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
        </div>
        <h2 className="text-2xl md:text-4xl font-bold text-slate-800 mb-4 bg-gradient-to-r from-educational-blue to-educational-purple bg-clip-text text-transparent">
          🌟 Choose Your Learning Adventure! 🌟
        </h2>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto mb-4">
          {getPersonalizedMessage()}
        </p>
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          <Badge className="bg-educational-green text-white px-3 py-1 text-sm animate-pulse">
            🎮 Interactive Learning
          </Badge>
          <Badge className="bg-educational-blue text-white px-3 py-1 text-sm animate-pulse delay-100">
            🔊 Audio Pronunciation
          </Badge>
          <Badge className="bg-educational-purple text-white px-3 py-1 text-sm animate-pulse delay-200">
            🏆 Achievement System
          </Badge>
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

      {/* Featured Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-6 md:mb-8">
        <Card className="bg-gradient-to-r from-educational-blue to-educational-purple text-white transform hover:scale-105 transition-all duration-300">
          <CardContent className="p-6 text-center">
            <Crown className="w-8 h-8 mx-auto mb-2" />
            <div className="text-3xl font-bold">{wordsDatabase.length}</div>
            <p className="text-sm opacity-90">Amazing Words</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-educational-green to-educational-blue text-white transform hover:scale-105 transition-all duration-300">
          <CardContent className="p-6 text-center">
            <Gift className="w-8 h-8 mx-auto mb-2" />
            <div className="text-3xl font-bold">{categories.length - 1}</div>
            <p className="text-sm opacity-90">Fun Categories</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-educational-orange to-educational-pink text-white transform hover:scale-105 transition-all duration-300">
          <CardContent className="p-6 text-center">
            <Zap className="w-8 h-8 mx-auto mb-2" />
            <div className="text-3xl font-bold">3</div>
            <p className="text-sm opacity-90">Difficulty Levels</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {categories.map((category, index) => {
          const isRecommended = userInterests.some(
            (interest) =>
              category.id.includes(interest) ||
              category.name.toLowerCase().includes(interest.toLowerCase()),
          );

          return (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all duration-500 md:hover:scale-110 hover:shadow-2xl md:transform md:hover:-translate-y-2 ${
                selectedCategory === category.id
                  ? "ring-4 ring-educational-blue shadow-2xl md:scale-105 bg-gradient-to-br from-blue-50 to-purple-50"
                  : hoveredCategory === category.id
                    ? "ring-2 ring-educational-purple shadow-xl md:scale-105"
                    : "hover:shadow-lg"
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
              onClick={() => handleCategoryClick(category.id)}
              onMouseEnter={() => handleCategoryHover(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <CardContent className="p-0 overflow-hidden">
                {/* Header with gradient */}
                <div
                  className={`bg-gradient-to-r ${category.gradient} p-6 text-white text-center relative overflow-hidden`}
                >
                  {/* Recommended Badge */}
                  {isRecommended && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-yellow-400 text-yellow-900 text-xs animate-pulse">
                        ⭐ For You!
                      </Badge>
                    </div>
                  )}

                  {/* Sparkle Effect on Hover */}
                  {hoveredCategory === category.id && (
                    <>
                      <Sparkles className="absolute top-2 right-2 w-6 h-6 text-yellow-300 animate-spin" />
                      <Star className="absolute bottom-2 left-2 w-5 h-5 text-yellow-300 animate-pulse" />
                      <Heart className="absolute bottom-2 right-2 w-5 h-5 text-pink-300 animate-bounce" />
                    </>
                  )}

                  <div
                    className={`text-4xl md:text-6xl mb-3 transition-transform duration-300 ${
                      hoveredCategory === category.id
                        ? "animate-bounce md:scale-110"
                        : ""
                    }`}
                  >
                    {category.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-1">{category.name}</h3>
                  <Badge className="bg-white/20 border-white/30 text-white">
                    <Zap className="w-3 h-3 mr-1" />
                    {category.wordCount} words
                  </Badge>

                  {/* Selection Animation */}
                  {selectedCategory === category.id && (
                    <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <p
                    className={`text-sm leading-relaxed transition-colors duration-300 ${
                      selectedCategory === category.id
                        ? "text-educational-blue font-semibold"
                        : "text-slate-600"
                    }`}
                  >
                    {category.description}
                  </p>

                  {/* Fun fact on hover */}
                  {hoveredCategory === category.id && (
                    <div className="bg-gradient-to-r from-educational-blue/10 to-educational-purple/10 rounded-lg p-3 animate-fade-in">
                      <p className="text-xs text-educational-purple font-semibold">
                        💡 {category.funFact}
                      </p>
                    </div>
                  )}

                  {/* Difficulty breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Difficulty Levels</span>
                      <span>{category.wordCount} total</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="w-full bg-green-100 rounded-full h-2 mb-1">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${category.wordCount > 0 ? (category.difficultyBreakdown.easy / category.wordCount) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-green-600 font-medium">
                          🌟 {category.difficultyBreakdown.easy}
                        </span>
                      </div>

                      <div className="text-center">
                        <div className="w-full bg-orange-100 rounded-full h-2 mb-1">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${category.wordCount > 0 ? (category.difficultyBreakdown.medium / category.wordCount) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-orange-600 font-medium">
                          ⭐ {category.difficultyBreakdown.medium}
                        </span>
                      </div>

                      <div className="text-center">
                        <div className="w-full bg-red-100 rounded-full h-2 mb-1">
                          <div
                            className="bg-red-500 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${category.wordCount > 0 ? (category.difficultyBreakdown.hard / category.wordCount) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-red-600 font-medium">
                          🔥 {category.difficultyBreakdown.hard}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Selection indicator */}
                  {selectedCategory === category.id && (
                    <div className="flex items-center justify-center">
                      <Badge className="bg-gradient-to-r from-educational-green to-educational-blue text-white animate-pulse px-4 py-2">
                        <Star className="w-4 h-4 mr-1 animate-spin" />
                        ✓ Selected - Ready to Learn!
                        <Sparkles className="w-4 h-4 ml-1 animate-bounce" />
                      </Badge>
                    </div>
                  )}

                  {/* Hover encouragement */}
                  {hoveredCategory === category.id &&
                    selectedCategory !== category.id && (
                      <div className="flex items-center justify-center mt-2">
                        <Badge className="bg-educational-purple/20 text-educational-purple border border-educational-purple/30 animate-pulse">
                          🎯 Click to explore!
                        </Badge>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-white rounded-full p-4 shadow-lg">
            <div className="flex items-center gap-2 text-educational-blue">
              <Heart className="w-5 h-5 fill-current" />
              <span className="font-semibold">
                Ready for your word adventure?
              </span>
              <Heart className="w-5 h-5 fill-current" />
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

        <p className="text-sm text-slate-500 mt-4 animate-pulse">
          ✨ Choose a category above to begin your vocabulary journey! ✨
        </p>
      </div>
    </div>
  );
}
