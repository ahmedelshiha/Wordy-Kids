import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  wordCount: number;
  description: string;
}

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const categories: Category[] = [
  {
    id: 'all',
    name: 'All Words',
    icon: '📚',
    color: 'bg-slate-500',
    wordCount: 200,
    description: 'Explore all vocabulary words'
  },
  {
    id: 'animals',
    name: 'Animals',
    icon: '🦋',
    color: 'bg-educational-blue',
    wordCount: 45,
    description: 'Creatures from around the world'
  },
  {
    id: 'food',
    name: 'Food',
    icon: '🍎',
    color: 'bg-educational-orange',
    wordCount: 38,
    description: 'Delicious treats and healthy foods'
  },
  {
    id: 'nature',
    name: 'Nature',
    icon: '🌳',
    color: 'bg-educational-green',
    wordCount: 42,
    description: 'Plants, weather, and natural wonders'
  },
  {
    id: 'science',
    name: 'Science',
    icon: '🔬',
    color: 'bg-educational-purple',
    wordCount: 35,
    description: 'Amazing scientific discoveries'
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: '⚽',
    color: 'bg-educational-pink',
    wordCount: 25,
    description: 'Games, activities, and athletics'
  },
  {
    id: 'general',
    name: 'General',
    icon: '🎯',
    color: 'bg-educational-yellow',
    wordCount: 15,
    description: 'Everyday words and concepts'
  }
];

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
