import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
}

interface CategorySelectorProps {
  categories?: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const enrichedCategories: Category[] = [
  {
    id: "all",
    name: "All Words",
    icon: "📚",
    color: "bg-slate-500",
    gradient: "from-slate-400 to-slate-600",
    wordCount: wordsDatabase.length,
    description: "Explore our complete vocabulary collection with 105+ words",
    difficultyBreakdown: {
      easy: wordsDatabase.filter((w) => w.difficulty === "easy").length,
      medium: wordsDatabase.filter((w) => w.difficulty === "medium").length,
      hard: wordsDatabase.filter((w) => w.difficulty === "hard").length,
    },
  },
  {
    id: "food",
    name: "Food & Nutrition",
    icon: "🍎",
    color: "bg-red-500",
    gradient: "from-red-400 to-orange-500",
    wordCount: getWordsByCategory("food").length,
    description: "Learn about healthy foods, fruits, and nutrition",
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
    id: "animals",
    name: "Animals & Wildlife",
    icon: "🦋",
    color: "bg-educational-blue",
    gradient: "from-blue-400 to-blue-600",
    wordCount: getWordsByCategory("animals").length,
    description: "Discover amazing creatures from around the world",
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
    id: "body",
    name: "Body Parts",
    icon: "👁️",
    color: "bg-pink-500",
    gradient: "from-pink-400 to-rose-500",
    wordCount: getWordsByCategory("body").length,
    description: "Learn about the human body and health",
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
    id: "family",
    name: "Family & People",
    icon: "👨‍👩‍👧‍👦",
    color: "bg-purple-500",
    gradient: "from-purple-400 to-purple-600",
    wordCount: getWordsByCategory("family").length,
    description: "Family members, relationships, and social connections",
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
    id: "colors",
    name: "Colors & Art",
    icon: "🎨",
    color: "bg-rainbow",
    gradient: "from-red-400 via-yellow-400 to-blue-400",
    wordCount: getWordsByCategory("colors").length,
    description: "Explore the vibrant world of colors and creativity",
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
    name: "Numbers & Math",
    icon: "🔢",
    color: "bg-green-600",
    gradient: "from-green-500 to-emerald-600",
    wordCount: getWordsByCategory("numbers").length,
    description: "Foundation mathematics and counting skills",
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
    id: "nature",
    name: "Nature & Environment",
    icon: "🌳",
    color: "bg-educational-green",
    gradient: "from-green-400 to-green-600",
    wordCount: getWordsByCategory("nature").length,
    description: "Explore the wonders of our natural world",
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
    id: "school",
    name: "School & Learning",
    icon: "🏫",
    color: "bg-indigo-500",
    gradient: "from-indigo-400 to-indigo-600",
    wordCount: getWordsByCategory("school").length,
    description: "Educational tools, classroom items, and learning",
    difficultyBreakdown: {
      easy: getWordsByCategory("school").filter((w) => w.difficulty === "easy")
        .length,
      medium: getWordsByCategory("school").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("school").filter((w) => w.difficulty === "hard")
        .length,
    },
  },
  {
    id: "transport",
    name: "Transportation",
    icon: "🚂",
    color: "bg-yellow-500",
    gradient: "from-yellow-400 to-orange-500",
    wordCount: getWordsByCategory("transport").length,
    description: "Vehicles, travel, and getting around",
    difficultyBreakdown: {
      easy: getWordsByCategory("transport").filter(
        (w) => w.difficulty === "easy",
      ).length,
      medium: getWordsByCategory("transport").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("transport").filter(
        (w) => w.difficulty === "hard",
      ).length,
    },
  },
  {
    id: "emotions",
    name: "Emotions & Feelings",
    icon: "😊",
    color: "bg-educational-pink",
    gradient: "from-pink-400 to-pink-600",
    wordCount: getWordsByCategory("emotions").length,
    description: "Understanding feelings, moods, and emotional intelligence",
    difficultyBreakdown: {
      easy: getWordsByCategory("emotions").filter(
        (w) => w.difficulty === "easy",
      ).length,
      medium: getWordsByCategory("emotions").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("emotions").filter(
        (w) => w.difficulty === "hard",
      ).length,
    },
  },
  {
    id: "weather",
    name: "Weather & Climate",
    icon: "🌤️",
    color: "bg-sky-500",
    gradient: "from-sky-400 to-blue-500",
    wordCount: getWordsByCategory("weather").length,
    description: "Weather patterns, seasons, and climate awareness",
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
    id: "actions",
    name: "Actions & Verbs",
    icon: "🏃",
    color: "bg-orange-500",
    gradient: "from-orange-400 to-red-500",
    wordCount: getWordsByCategory("actions").length,
    description: "Action words, movement, and daily activities",
    difficultyBreakdown: {
      easy: getWordsByCategory("actions").filter((w) => w.difficulty === "easy")
        .length,
      medium: getWordsByCategory("actions").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("actions").filter((w) => w.difficulty === "hard")
        .length,
    },
  },
  {
    id: "hobbies",
    name: "Hobbies & Activities",
    icon: "🎨🎮",
    color: "bg-violet-500",
    gradient: "from-violet-400 to-purple-500",
    wordCount: getWordsByCategory("hobbies").length,
    description: "Fun activities, recreation, and creative pursuits",
    difficultyBreakdown: {
      easy: getWordsByCategory("hobbies").filter((w) => w.difficulty === "easy")
        .length,
      medium: getWordsByCategory("hobbies").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("hobbies").filter((w) => w.difficulty === "hard")
        .length,
    },
  },
  {
    id: "science",
    name: "Science & Discovery",
    icon: "🔬",
    color: "bg-educational-purple",
    gradient: "from-purple-400 to-purple-600",
    wordCount: getWordsByCategory("science").length,
    description: "Scientific concepts, experiments, and STEM learning",
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
    id: "sports",
    name: "Sports & Fitness",
    icon: "⚽",
    color: "bg-green-500",
    gradient: "from-green-400 to-green-600",
    wordCount: getWordsByCategory("sports").length,
    description: "Sports, games, physical activity, and health",
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
    id: "house",
    name: "Home & Living",
    icon: "🏠",
    color: "bg-amber-500",
    gradient: "from-amber-400 to-orange-500",
    wordCount: getWordsByCategory("house").length,
    description: "Home, rooms, furniture, and living spaces",
    difficultyBreakdown: {
      easy: getWordsByCategory("house").filter((w) => w.difficulty === "easy")
        .length,
      medium: getWordsByCategory("house").filter(
        (w) => w.difficulty === "medium",
      ).length,
      hard: getWordsByCategory("house").filter((w) => w.difficulty === "hard")
        .length,
    },
  },
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories = enrichedCategories,
  selectedCategory,
  onSelectCategory,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-educational-green text-white";
      case "medium":
        return "bg-educational-orange text-white";
      case "hard":
        return "bg-educational-pink text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getProgressPercentage = (category: Category) => {
    const total =
      category.difficultyBreakdown.easy +
      category.difficultyBreakdown.medium +
      category.difficultyBreakdown.hard;
    return total > 0 ? (category.difficultyBreakdown.easy / total) * 100 : 0;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink p-6 rounded-full shadow-2xl">
            <div className="text-4xl">🌟</div>
          </div>
        </div>
        <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">
          🎓 Choose Your Learning Adventure!
        </h2>
        <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8">
          Select a category to start your vocabulary journey. Each category is
          designed following Oxford learning paths!
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-educational-blue">
              {wordsDatabase.length}
            </div>
            <div className="text-sm text-gray-600">Total Words</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-educational-green">
              {categories.length - 1}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-educational-orange">
              {wordsDatabase.filter((w) => w.difficulty === "easy").length}
            </div>
            <div className="text-sm text-gray-600">Easy Words</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-educational-purple">
              {wordsDatabase.filter((w) => w.difficulty === "hard").length}
            </div>
            <div className="text-sm text-gray-600">Challenge Words</div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Card
            key={category.id}
            className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 ${
              selectedCategory === category.id
                ? "border-educational-blue bg-educational-blue/5 shadow-lg scale-105"
                : "border-gray-200 hover:border-educational-blue/50"
            }`}
            onClick={() => onSelectCategory(category.id)}
          >
            <CardContent className="p-6">
              <div className="text-center">
                {/* Category Icon */}
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${category.gradient} flex items-center justify-center text-3xl shadow-lg`}
                >
                  {category.icon}
                </div>

                {/* Category Name */}
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {category.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 min-h-[40px]">
                  {category.description}
                </p>

                {/* Word Count */}
                <div className="mb-4">
                  <div className="text-2xl font-bold text-educational-blue">
                    {category.wordCount}
                  </div>
                  <div className="text-sm text-gray-600">
                    {category.wordCount === 1 ? "Word" : "Words"}
                  </div>
                </div>

                {/* Difficulty Breakdown */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span>Learning Progress</span>
                    <span>
                      {Math.round(getProgressPercentage(category))}% Easy
                    </span>
                  </div>
                  <Progress
                    value={getProgressPercentage(category)}
                    className="h-2"
                  />

                  <div className="flex gap-1 justify-center mt-3">
                    {category.difficultyBreakdown.easy > 0 && (
                      <Badge
                        className={getDifficultyColor("easy")}
                        variant="secondary"
                      >
                        {category.difficultyBreakdown.easy} Easy
                      </Badge>
                    )}
                    {category.difficultyBreakdown.medium > 0 && (
                      <Badge
                        className={getDifficultyColor("medium")}
                        variant="secondary"
                      >
                        {category.difficultyBreakdown.medium} Medium
                      </Badge>
                    )}
                    {category.difficultyBreakdown.hard > 0 && (
                      <Badge
                        className={getDifficultyColor("hard")}
                        variant="secondary"
                      >
                        {category.difficultyBreakdown.hard} Hard
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  className={`w-full transition-all ${
                    selectedCategory === category.id
                      ? "bg-educational-blue text-white"
                      : "bg-white border border-educational-blue text-educational-blue hover:bg-educational-blue hover:text-white"
                  }`}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                >
                  {selectedCategory === category.id ? "Selected ✓" : "Explore"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Oxford Learning Path Info */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            🎯 Oxford Learning Path Structure
          </h3>
          <p className="text-gray-600 mb-4">
            Our vocabulary is carefully structured using Oxford's progressive
            learning methodology, ensuring age-appropriate content and
            systematic skill development.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg p-4">
              <div className="text-green-600 text-2xl mb-2">🌱</div>
              <div className="font-semibold text-green-700">Foundation</div>
              <div className="text-sm text-gray-600">
                Basic everyday vocabulary
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-orange-600 text-2xl mb-2">🌿</div>
              <div className="font-semibold text-orange-700">Developing</div>
              <div className="text-sm text-gray-600">Contextual word usage</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-purple-600 text-2xl mb-2">🌳</div>
              <div className="font-semibold text-purple-700">Advanced</div>
              <div className="text-sm text-gray-600">
                Complex concepts & expressions
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
