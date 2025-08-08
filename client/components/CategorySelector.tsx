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
    icon: '��',
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
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Choose Your Adventure
        </h2>
        <p className="text-slate-600">
          Select a category to start learning new words!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card
            key={category.id}
            className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              selectedCategory === category.id 
                ? 'ring-2 ring-educational-blue shadow-lg' 
                : ''
            }`}
            onClick={() => onSelectCategory(category.id)}
          >
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-4">{category.icon}</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {category.name}
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                {category.description}
              </p>
              <div className="flex items-center justify-between">
                <Badge 
                  className={`${category.color} text-white`}
                >
                  {category.wordCount} words
                </Badge>
                {selectedCategory === category.id && (
                  <Badge className="bg-green-500 text-white">
                    ✓ Selected
                  </Badge>
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
          className="bg-educational-blue text-white hover:bg-educational-blue/90"
        >
          Start Learning {categories.find(c => c.id === selectedCategory)?.name}
        </Button>
      </div>
    </div>
  );
};
