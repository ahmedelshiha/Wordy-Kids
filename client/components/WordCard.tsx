import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, Heart, RotateCcw } from 'lucide-react';
import { playSoundIfEnabled } from '@/lib/soundEffects';

interface Word {
  id: number;
  word: string;
  pronunciation?: string;
  definition: string;
  example?: string;
  funFact?: string;
  emoji?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
}

interface WordCardProps {
  word: Word;
  showDefinition?: boolean;
  onPronounce?: (word: Word) => void;
  onFavorite?: (word: Word) => void;
  className?: string;
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  showDefinition = false,
  onPronounce,
  onFavorite,
  className = ''
}) => {
  const [isFlipped, setIsFlipped] = useState(showDefinition);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const handlePronounce = async () => {
    if (isPlaying || !word.pronunciation) return;

    setIsPlaying(true);
    playSoundIfEnabled.pronunciation();

    // Simulate audio playback for demo
    setTimeout(() => {
      setIsPlaying(false);
      onPronounce?.(word);
    }, 1000);
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    playSoundIfEnabled.click();
    onFavorite?.(word);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-educational-green text-white';
      case 'medium': return 'bg-educational-orange text-white';
      case 'hard': return 'bg-educational-pink text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      animals: 'bg-educational-blue',
      food: 'bg-educational-orange',
      nature: 'bg-educational-green',
      general: 'bg-educational-purple',
      science: 'bg-educational-pink',
      sports: 'bg-educational-yellow'
    };
    return colors[category as keyof typeof colors] || 'bg-educational-blue';
  };

  return (
    <div className={`relative w-full max-w-sm mx-auto ${className}`}>
      <Card
        className={`h-80 cursor-pointer transition-all duration-700 transform-gpu hover:scale-105 ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
        style={{ transformStyle: 'preserve-3d' }}
        onClick={() => {
          setIsFlipped(!isFlipped);
          playSoundIfEnabled.click();
        }}
      >
        {/* Front of card */}
        <CardContent 
          className={`absolute inset-0 w-full h-full ${getCategoryColor(word.category)} rounded-xl p-6 flex flex-col items-center justify-center text-white`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className={getDifficultyColor(word.difficulty)}>
              {word.difficulty}
            </Badge>
            <Badge variant="outline" className="bg-white/20 border-white/30 text-white">
              {word.category}
            </Badge>
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 p-2 h-auto"
              onClick={(e) => {
                e.stopPropagation();
                handleFavorite();
              }}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {word.imageUrl ? (
            <img
              src={word.imageUrl}
              alt={word.word}
              className="w-24 h-24 object-cover rounded-full mb-4 shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-4 text-6xl">
              {word.emoji || '📚'}
            </div>
          )}
          
          <h2 className="text-4xl font-bold mb-3 text-center">
            {word.word}
          </h2>
          
          {word.pronunciation && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg opacity-90">{word.pronunciation}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePronounce();
                }}
                disabled={isPlaying}
                className="text-white hover:bg-white/20 p-2 h-auto"
              >
                <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
              </Button>
            </div>
          )}
          
          <p className="text-center text-sm opacity-75 mt-auto">
            <RotateCcw className="w-4 h-4 inline mr-1" />
            Tap to see definition
          </p>
        </CardContent>

        {/* Back of card */}
        <CardContent
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-6 flex flex-col justify-center text-white"
          style={{ 
            backfaceVisibility: 'hidden', 
            transform: 'rotateY(180deg)' 
          }}
        >
          <div className="absolute top-4 right-4">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 p-2 h-auto"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <h3 className="text-2xl font-semibold mb-4 text-center">
            {word.word} {word.emoji}
          </h3>
          
          <div className="space-y-4 flex-1">
            <div>
              <h4 className="text-sm font-medium mb-2 text-yellow-300">Definition:</h4>
              <p className="text-lg leading-relaxed">{word.definition}</p>
            </div>
            
            {word.example && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-green-300">Example:</h4>
                <p className="italic opacity-90">"{word.example}"</p>
              </div>
            )}
            
            {word.funFact && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-pink-300">Fun Fact:</h4>
                <p className="text-sm opacity-90">{word.funFact}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
