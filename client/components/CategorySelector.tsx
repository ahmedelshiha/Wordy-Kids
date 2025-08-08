import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getAllCategories, getWordsByCategory, wordsDatabase } from '@/data/wordsDatabase';

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
    id: 'all',
    name: 'All Words',
    icon: '📚',
    color: 'bg-slate-500',
    gradient: 'from-slate-400 to-slate-600',
    wordCount: wordsDatabase.length,
    description: 'Explore our complete vocabulary collection',
    difficultyBreakdown: {
      easy: wordsDatabase.filter(w => w.difficulty === 'easy').length,
      medium: wordsDatabase.filter(w => w.difficulty === 'medium').length,
      hard: wordsDatabase.filter(w => w.difficulty === 'hard').length,
    }
  },
  {
    id: 'animals',
    name: 'Animals',
    icon: '🦋',
    color: 'bg-educational-blue',
    gradient: 'from-blue-400 to-blue-600',
    wordCount: getWordsByCategory('animals').length,
    description: 'Discover amazing creatures from around the world',
    difficultyBreakdown: {
      easy: getWordsByCategory('animals').filter(w => w.difficulty === 'easy').length,
      medium: getWordsByCategory('animals').filter(w => w.difficulty === 'medium').length,
      hard: getWordsByCategory('animals').filter(w => w.difficulty === 'hard').length,
    }
  },
  {
    id: 'nature',
    name: 'Nature',
    icon: '🌳',
    color: 'bg-educational-green',
    gradient: 'from-green-400 to-green-600',
    wordCount: getWordsByCategory('nature').length,
    description: 'Explore the wonders of our natural world',
    difficultyBreakdown: {
      easy: getWordsByCategory('nature').filter(w => w.difficulty === 'easy').length,
      medium: getWordsByCategory('nature').filter(w => w.difficulty === 'medium').length,
      hard: getWordsByCategory('nature').filter(w => w.difficulty === 'hard').length,
    }
  },
  {
    id: 'science',
    name: 'Science',
    icon: '🔬',
    color: 'bg-educational-purple',
    gradient: 'from-purple-400 to-purple-600',
    wordCount: getWordsByCategory('science').length,
    description: 'Amazing scientific discoveries and concepts',
    difficultyBreakdown: {
      easy: getWordsByCategory('science').filter(w => w.difficulty === 'easy').length,
      medium: getWordsByCategory('science').filter(w => w.difficulty === 'medium').length,
      hard: getWordsByCategory('science').filter(w => w.difficulty === 'hard').length,
    }
  },
  {
    id: 'food',
    name: 'Food',
    icon: '🍎',
    color: 'bg-educational-orange',
    gradient: 'from-orange-400 to-orange-600',
    wordCount: getWordsByCategory('food').length,
    description: 'Delicious treats and healthy foods',
    difficultyBreakdown: {
      easy: getWordsByCategory('food').filter(w => w.difficulty === 'easy').length,
      medium: getWordsByCategory('food').filter(w => w.difficulty === 'medium').length,
      hard: getWordsByCategory('food').filter(w => w.difficulty === 'hard').length,
    }
  },
  {
    id: 'emotions',
    name: 'Emotions',
    icon: '😊',
    color: 'bg-educational-pink',
    gradient: 'from-pink-400 to-pink-600',
    wordCount: getWordsByCategory('emotions').length,
    description: 'Understanding feelings and emotions',
    difficultyBreakdown: {
      easy: getWordsByCategory('emotions').filter(w => w.difficulty === 'easy').length,
      medium: getWordsByCategory('emotions').filter(w => w.difficulty === 'medium').length,
      hard: getWordsByCategory('emotions').filter(w => w.difficulty === 'hard').length,
    }
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: '🤖',
    color: 'bg-slate-600',
    gradient: 'from-slate-500 to-slate-700',
    wordCount: getWordsByCategory('technology').length,
    description: 'Modern inventions and digital world',
    difficultyBreakdown: {
      easy: getWordsByCategory('technology').filter(w => w.difficulty === 'easy').length,
      medium: getWordsByCategory('technology').filter(w => w.difficulty === 'medium').length,
      hard: getWordsByCategory('technology').filter(w => w.difficulty === 'hard').length,
    }
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: '⚽',
    color: 'bg-green-500',
    gradient: 'from-green-400 to-green-600',
    wordCount: getWordsByCategory('sports').length,
    description: 'Games, activities, and athletics',
    difficultyBreakdown: {
      easy: getWordsByCategory('sports').filter(w => w.difficulty === 'easy').length,
      medium: getWordsByCategory('sports').filter(w => w.difficulty === 'medium').length,
      hard: getWordsByCategory('sports').filter(w => w.difficulty === 'hard').length,
    }
  },
  {
    id: 'music',
    name: 'Music',
    icon: '🎵',
    color: 'bg-purple-500',
    gradient: 'from-purple-400 to-purple-600',
    wordCount: getWordsByCategory('music').length,
    description: 'Musical instruments, rhythms, and melodies',
    difficultyBreakdown: {
      easy: getWordsByCategory('music').filter(w => w.difficulty === 'easy').length,
      medium: getWordsByCategory('music').filter(w => w.difficulty === 'medium').length,
      hard: getWordsByCategory('music').filter(w => w.difficulty === 'hard').length,
    }
  },
  {
    id: 'space',
    name: 'Space',
    icon: '⭐',
    color: 'bg-indigo-600',
    gradient: 'from-indigo-500 to-indigo-700',
    wordCount: getWordsByCategory('space').length,
    description: 'Explore the mysteries of the cosmos',
    difficultyBreakdown: {
      easy: getWordsByCategory('space').filter(w => w.difficulty === 'easy').length,
      medium: getWordsByCategory('space').filter(w => w.difficulty === 'medium').length,
      hard: getWordsByCategory('space').filter(w => w.difficulty === 'hard').length,
    }
  },
  {
    id: 'transportation',
    name: 'Transportation',
    icon: '🚁',
    color: 'bg-yellow-500',
    gradient: 'from-yellow-400 to-yellow-600',
    wordCount: getWordsByCategory('transportation').length,
    description: 'Vehicles and ways to travel',
    difficultyBreakdown: {
      easy: getWordsByCategory('transportation').filter(w => w.difficulty === 'easy').length,
      medium: getWordsByCategory('transportation').filter(w => w.difficulty === 'medium').length,
      hard: getWordsByCategory('transportation').filter(w => w.difficulty === 'hard').length,
    }
  },
  {
    id: 'weather',
    name: 'Weather',
    icon: '⛈️',
    color: 'bg-blue-500',
    gradient: 'from-blue-400 to-blue-600',
    wordCount: getWordsByCategory('weather').length,
    description: 'Storms, sunshine, and climate patterns',
    difficultyBreakdown: {
      easy: getWordsByCategory('weather').filter(w => w.difficulty === 'easy').length,
      medium: getWordsByCategory('weather').filter(w => w.difficulty === 'medium').length,
      hard: getWordsByCategory('weather').filter(w => w.difficulty === 'hard').length,
    }
  },
  {
    id: 'adventure',
    name: 'Adventure',
    icon: '🗺️',
    color: 'bg-red-500',
    gradient: 'from-red-400 to-red-600',
    wordCount: getWordsByCategory('adventure').length,
    description: 'Exciting journeys and discoveries',
    difficultyBreakdown: {
      easy: getWordsByCategory('adventure').filter(w => w.difficulty === 'easy').length,
      medium: getWordsByCategory('adventure').filter(w => w.difficulty === 'medium').length,
      hard: getWordsByCategory('adventure').filter(w => w.difficulty === 'hard').length,
    }
  },
  {
    id: 'colors',
    name: 'Colors',
    icon: '🌈',
    color: 'bg-pink-500',
    gradient: 'from-pink-400 to-pink-600',
    wordCount: getWordsByCategory('colors').length,
    description: 'Beautiful shades and hues',
    difficultyBreakdown: {
      easy: getWordsByCategory('colors').filter(w => w.difficulty === 'easy').length,
      medium: getWordsByCategory('colors').filter(w => w.difficulty === 'medium').length,
      hard: getWordsByCategory('colors').filter(w => w.difficulty === 'hard').length,
    }
  }
].filter(category => category.wordCount > 0 || category.id === 'all');

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory = 'all',
  onSelectCategory
}) => {
  const categories = enrichedCategories;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-slate-800 mb-4">
          🌟 Choose Your Learning Adventure! 🌟
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Explore our rich collection of vocabulary across exciting categories.
          Each category is packed with words, fun facts, and amazing discoveries!
        </p>
      </div>

      {/* Featured Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
        <Card className="bg-gradient-to-r from-educational-blue to-educational-purple text-white">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold">{wordsDatabase.length}</div>
            <p className="text-sm opacity-90">Total Words</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-educational-green to-educational-blue text-white">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold">{categories.length - 1}</div>
            <p className="text-sm opacity-90">Categories</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-educational-orange to-educational-pink text-white">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold">3</div>
            <p className="text-sm opacity-90">Difficulty Levels</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Card
            key={category.id}
            className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl transform ${
              selectedCategory === category.id
                ? 'ring-4 ring-educational-blue shadow-2xl scale-105'
                : 'hover:shadow-lg'
            }`}
            onClick={() => onSelectCategory(category.id)}
          >
            <CardContent className="p-0 overflow-hidden">
              {/* Header with gradient */}
              <div className={`bg-gradient-to-r ${category.gradient} p-6 text-white text-center`}>
                <div className="text-6xl mb-3">{category.icon}</div>
                <h3 className="text-xl font-bold mb-1">
                  {category.name}
                </h3>
                <Badge
                  className="bg-white/20 border-white/30 text-white"
                >
                  {category.wordCount} words
                </Badge>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  {category.description}
                </p>

                {/* Difficulty breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Difficulty Levels</span>
                    <span>{category.difficultyBreakdown.easy + category.difficultyBreakdown.medium + category.difficultyBreakdown.hard} total</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="w-full bg-green-100 rounded-full h-2 mb-1">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${category.wordCount > 0 ? (category.difficultyBreakdown.easy / category.wordCount) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-green-600 font-medium">{category.difficultyBreakdown.easy} Easy</span>
                    </div>

                    <div className="text-center">
                      <div className="w-full bg-orange-100 rounded-full h-2 mb-1">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{
                            width: `${category.wordCount > 0 ? (category.difficultyBreakdown.medium / category.wordCount) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-orange-600 font-medium">{category.difficultyBreakdown.medium} Medium</span>
                    </div>

                    <div className="text-center">
                      <div className="w-full bg-red-100 rounded-full h-2 mb-1">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{
                            width: `${category.wordCount > 0 ? (category.difficultyBreakdown.hard / category.wordCount) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-red-600 font-medium">{category.difficultyBreakdown.hard} Hard</span>
                    </div>
                  </div>
                </div>

                {/* Selection indicator */}
                {selectedCategory === category.id && (
                  <div className="flex items-center justify-center">
                    <Badge className="bg-green-500 text-white animate-pulse">
                      ✓ Selected - Ready to Learn!
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button
          size="lg"
          onClick={() => onSelectCategory(selectedCategory)}
          className="bg-gradient-to-r from-educational-blue to-educational-purple text-white hover:from-educational-blue/90 hover:to-educational-purple/90 text-lg px-8 py-3 rounded-full font-semibold transform hover:scale-105 transition-all duration-300"
        >
          🚀 Start Learning {categories.find(c => c.id === selectedCategory)?.name}! 🚀
        </Button>
      </div>
    </div>
  );
};
