// List view component for word display
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Volume2, 
  Heart, 
  Crown, 
  Star, 
  Share,
  Trophy
} from 'lucide-react';
import { audioService } from '../lib/audioService';

export const WordLibraryListView = ({
  words,
  onWordMastery,
  onWordFavorite,
  onWordShare,
  isWordMastered,
  isWordFavorited,
  accessibilitySettings,
  isMobile
}) => {
  // Handle word pronunciation
  const handlePronounce = (word) => {
    if (word.sound) {
      audioService.playWordSound(word);
    } else {
      audioService.pronounceWord(word.word);
    }
  };

  return (
    <div className="space-y-4">
      {words.map((word) => {
        const isMastered = isWordMastered?.(word.id) || false;
        const isFavorited = isWordFavorited?.(word.id) || false;
        
        return (
          <Card
            key={word.id}
            className={`
              transition-all duration-300
              ${accessibilitySettings.highContrast ? 'bg-black text-white border-white' : ''}
              ${isMastered ? 'border-l-4 border-l-green-500' : ''}
              ${isFavorited ? 'border-r-4 border-r-red-500' : ''}
              hover:shadow-md
            `}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {/* Emoji and word */}
                    <span className="text-3xl">{word.emoji}</span>
                    <div className="min-w-0">
                      <h3 className={`font-bold truncate ${
                        accessibilitySettings.largeText ? 'text-2xl' : 'text-xl'
                      }`}>
                        {word.word}
                      </h3>
                      
                      {/* Category and difficulty */}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="capitalize">
                          {word.category}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={`capitalize ${
                            word.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                            word.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {word.difficulty}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={`capitalize ${
                            word.rarity === 'mythical' ? 'bg-pink-100 text-pink-800' :
                            word.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                            word.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                            word.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {word.rarity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Definition */}
                  <p className={`${
                    accessibilitySettings.largeText ? 'text-lg' : 'text-base'
                  } ${
                    accessibilitySettings.highContrast ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {word.definition}
                  </p>
                  
                  {/* Example */}
                  {word.example && (
                    <p className={`italic mt-1 ${
                      accessibilitySettings.largeText ? 'text-base' : 'text-sm'
                    } ${
                      accessibilitySettings.highContrast ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      "{word.example}"
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePronounce(word)}
                    className="min-h-[44px] min-w-[44px] p-0"
                    aria-label={`Pronounce ${word.word}`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant={isFavorited ? "default" : "outline"}
                    onClick={() => onWordFavorite(word.id)}
                    className={`min-h-[44px] min-w-[44px] p-0 ${
                      isFavorited ? 'bg-red-500 hover:bg-red-600' : ''
                    }`}
                    aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                  </Button>

                  <Button
                    size="sm"
                    variant={isMastered ? "default" : "outline"}
                    onClick={() => onWordMastery(word.id, 'mastered')}
                    className={`min-h-[44px] min-w-[44px] p-0 ${
                      isMastered ? 'bg-green-500 hover:bg-green-600' : ''
                    }`}
                    aria-label={isMastered ? "Already mastered" : "Mark as mastered"}
                  >
                    <Crown className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onWordShare?.(word)}
                    className="min-h-[44px] min-w-[44px] p-0"
                    aria-label={`Share ${word.word}`}
                  >
                    <Share className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Fun fact (collapsible on mobile) */}
              {word.funFact && !isMobile && (
                <div className={`mt-3 p-2 rounded-lg ${
                  accessibilitySettings.highContrast ? 'bg-gray-800' : 'bg-yellow-50'
                }`}>
                  <p className={`flex items-center gap-2 ${
                    accessibilitySettings.largeText ? 'text-sm' : 'text-xs'
                  } ${
                    accessibilitySettings.highContrast ? 'text-gray-300' : 'text-yellow-800'
                  }`}>
                    <span className="text-base">🤓</span>
                    <strong>Fun Fact:</strong> {word.funFact}
                  </p>
                </div>
              )}

              {/* Status badges */}
              <div className="flex gap-2 mt-3">
                {isMastered && (
                  <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    Mastered
                  </Badge>
                )}
                {isFavorited && (
                  <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-current" />
                    Favorite
                  </Badge>
                )}
                {word.habitat && (
                  <Badge variant="outline" className="text-xs">
                    {word.habitat}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

