// Category selection view component
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Lock, 
  Star, 
  Trophy, 
  MapPin,
  Sparkles,
  Crown
} from 'lucide-react';
import { getCategories, getCategoryEmoji } from '../data/wordsDatabase';
import { audioService } from '../lib/audioService';

export const WordLibraryCategoryView = ({
  selectedCategory,
  onCategorySelect,
  isCategoryUnlocked,
  accessibilitySettings,
  gameStats,
  isMobile
}) => {
  const categories = getCategories();

  // Add special "all" category
  const allCategories = [
    {
      id: 'all',
      name: 'All Words',
      emoji: '🌍',
      wordCount: categories.reduce((sum, cat) => sum + cat.wordCount, 0),
      description: 'Explore all jungle words together!',
      unlocked: true,
      progress: 85 // Mock progress
    },
    ...categories.map(cat => ({
      ...cat,
      unlocked: isCategoryUnlocked(cat.id),
      progress: Math.floor(Math.random() * 100), // Mock progress
      description: getCategoryDescription(cat.id)
    }))
  ];

  function getCategoryDescription(categoryId) {
    const descriptions = {
      animals: 'Meet amazing jungle creatures!',
      nature: 'Discover beautiful plants and landscapes!',
      food: 'Find delicious jungle treats!',
      objects: 'Explore useful jungle items!',
      fantasy: 'Enter a world of magic and wonder!'
    };
    return descriptions[categoryId] || 'Discover new words!';
  }

  const handleCategoryClick = (category) => {
    if (!category.unlocked) {
      // Show unlock requirement
      audioService.playSound('incorrect');
      return;
    }

    onCategorySelect(category.id);
    audioService.playSound('click');
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([50]);
    }
  };

  const CategoryCard = ({ category }) => {
    const isSelected = selectedCategory === category.id;
    const isLocked = !category.unlocked;

    return (
      <Card className={`
        relative overflow-hidden cursor-pointer transition-all duration-300 group
        ${isSelected ? 'ring-2 ring-green-500 shadow-lg' : ''}
        ${isLocked ? 'opacity-60' : 'hover:scale-105 hover:shadow-xl'}
        ${accessibilitySettings.highContrast ? 'bg-black text-white border-white' : 'bg-white'}
        ${accessibilitySettings.reducedMotion ? '' : 'transform'}
      `}>
        
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${
          category.id === 'all' ? 'from-green-400 to-emerald-500' :
          category.id === 'animals' ? 'from-orange-400 to-red-500' :
          category.id === 'nature' ? 'from-green-400 to-teal-500' :
          category.id === 'food' ? 'from-yellow-400 to-orange-500' :
          category.id === 'objects' ? 'from-blue-400 to-indigo-500' :
          category.id === 'fantasy' ? 'from-purple-400 to-pink-500' :
          'from-gray-400 to-gray-500'
        } opacity-10`} />

        <CardContent 
          className="p-6 text-center relative z-10"
          onClick={() => handleCategoryClick(category)}
        >
          {/* Lock overlay */}
          {isLocked && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-20">
              <div className="bg-white rounded-full p-3 shadow-lg">
                <Lock className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          )}

          {/* Category emoji */}
          <div className={`text-6xl mb-4 transition-transform duration-300 ${
            accessibilitySettings.reducedMotion ? '' : 'group-hover:scale-110'
          }`}>
            {category.emoji}
          </div>

          {/* Category name */}
          <h3 className={`font-bold mb-2 ${
            accessibilitySettings.largeText ? 'text-2xl' : 'text-xl'
          } ${
            accessibilitySettings.highContrast ? 'text-white' : 'text-gray-800'
          }`}>
            {category.name}
          </h3>

          {/* Description */}
          <p className={`text-gray-600 mb-4 ${
            accessibilitySettings.largeText ? 'text-base' : 'text-sm'
          } ${
            accessibilitySettings.highContrast ? 'text-gray-300' : ''
          }`}>
            {category.description}
          </p>

          {/* Word count */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {category.wordCount} words
            </Badge>
            
            {category.progress > 80 && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
                <Crown className="w-3 h-3" />
                Expert
              </Badge>
            )}
          </div>

          {/* Progress bar */}
          {!isLocked && category.progress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{category.progress}%</span>
              </div>
              <Progress 
                value={category.progress} 
                className="h-2"
              />
            </div>
          )}

          {/* Unlock requirement */}
          {isLocked && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-center gap-2 text-yellow-800">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Complete more words to unlock!
                </span>
              </div>
            </div>
          )}

          {/* Special effects for completed categories */}
          {category.progress === 100 && !accessibilitySettings.reducedMotion && (
            <div className="absolute top-2 right-2">
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            </div>
          )}
        </CardContent>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            ACTIVE
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className={`font-bold mb-2 ${
          accessibilitySettings.largeText ? 'text-3xl' : 'text-2xl'
        } ${
          accessibilitySettings.highContrast ? 'text-white' : 'text-gray-800'
        }`}>
          🗺️ Choose Your Jungle Adventure
        </h2>
        <p className={`text-gray-600 ${
          accessibilitySettings.largeText ? 'text-lg' : 'text-base'
        } ${
          accessibilitySettings.highContrast ? 'text-gray-300' : ''
        }`}>
          Select a category to start exploring amazing words!
        </p>
      </div>

      {/* Stats summary */}
      <Card className={`${
        accessibilitySettings.highContrast ? 'bg-black text-white border-white' : 'bg-gradient-to-r from-green-50 to-emerald-50'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-6 text-center">
            <div>
              <div className={`font-bold ${
                accessibilitySettings.largeText ? 'text-2xl' : 'text-xl'
              } text-green-600`}>
                {gameStats.masteredWordsCount}
              </div>
              <div className="text-sm text-gray-600">Words Mastered</div>
            </div>
            <div>
              <div className={`font-bold ${
                accessibilitySettings.largeText ? 'text-2xl' : 'text-xl'
              } text-yellow-600`}>
                {gameStats.jungleGems}
              </div>
              <div className="text-sm text-gray-600">Jungle Gems</div>
            </div>
            <div>
              <div className={`font-bold ${
                accessibilitySettings.largeText ? 'text-2xl' : 'text-xl'
              } text-blue-600`}>
                {gameStats.badgesCount}
              </div>
              <div className="text-sm text-gray-600">Badges</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {allCategories.map(category => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      {/* Unlock hint */}
      <div className="text-center text-sm text-gray-600 mt-8">
        <p>Complete more words to unlock new jungle areas!</p>
      </div>
    </div>
  );
};

