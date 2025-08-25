// Enhanced Jungle Word Card component for preschoolers
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Volume2, 
  Heart, 
  Star, 
  Crown, 
  Sparkles,
  Share,
  Eye,
  Trophy
} from 'lucide-react';
import { getRarityColor, getDifficultyStars } from '../data/wordsDatabase';
import { audioService } from '../lib/audioService';

export const JungleWordCard = ({ 
  word,
  isWordMastered,
  isWordFavorited,
  onWordMastery,
  onWordFavorite,
  onWordShare,
  accessibilitySettings,
  showAnimations = true,
  autoPlay = false,
  className = ""
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDefinition, setShowDefinition] = useState(true);
  const [currentAnimation, setCurrentAnimation] = useState('');
  const [particles, setParticles] = useState([]);

  const isMastered = isWordMastered?.(word.id) || false;
  const isFavorited = isWordFavorited?.(word.id) || false;

  // Auto-play pronunciation when card appears
  useEffect(() => {
    if (autoPlay && accessibilitySettings.soundEnabled) {
      const timer = setTimeout(() => {
        handlePronounce();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [word.id, autoPlay, accessibilitySettings.soundEnabled]);

  // Create particle effects
  const createParticles = () => {
    if (!showAnimations || accessibilitySettings.reducedMotion) return;
    
    const newParticles = [];
    for (let i = 0; i < 6; i++) {
      newParticles.push({
        id: Math.random(),
        emoji: ['✨', '⭐', '🌟', '💫', '🎉', '🎊'][Math.floor(Math.random() * 6)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2000);
  };

  // Handle word pronunciation
  const handlePronounce = () => {
    if (word.sound) {
      audioService.playWordSound(word);
    } else {
      audioService.pronounceWord(word.word);
    }
    
    // Visual feedback
    if (showAnimations && !accessibilitySettings.reducedMotion) {
      setCurrentAnimation('bounce');
      createParticles();
      setTimeout(() => setCurrentAnimation(''), 1000);
    }
  };

  // Handle card tap/click
  const handleCardClick = () => {
    handlePronounce();
    
    // Flip animation
    if (showAnimations && !accessibilitySettings.reducedMotion) {
      setIsFlipped(true);
      setTimeout(() => setIsFlipped(false), 600);
    }
  };

  // Handle mastery
  const handleMastery = (e) => {
    e.stopPropagation();
    if (onWordMastery) {
      onWordMastery(word.id, 'mastered');
    }
    createParticles();
    audioService.playSound('celebration');
  };

  // Handle favorite toggle
  const handleFavorite = (e) => {
    e.stopPropagation();
    if (onWordFavorite) {
      onWordFavorite(word.id);
    }
    audioService.playSound(isFavorited ? 'click' : 'sparkle');
  };

  // Handle share
  const handleShare = (e) => {
    e.stopPropagation();
    if (onWordShare) {
      onWordShare(word);
    }
  };

  // Get difficulty stars
  const renderDifficultyStars = () => {
    const starCount = getDifficultyStars(word.difficulty);
    return Array.from({ length: starCount }, (_, i) => (
      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
    ));
  };

  return (
    <div className={`relative ${className}`}>
      {/* Floating Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute text-2xl animate-ping pointer-events-none z-10"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`
          }}
        >
          {particle.emoji}
        </div>
      ))}

      <Card className={`
        relative overflow-hidden cursor-pointer transition-all duration-500 group
        ${getRarityColor(word.rarity)}
        ${currentAnimation === 'bounce' && !accessibilitySettings.reducedMotion ? 'animate-bounce' : ''}
        ${isFlipped && !accessibilitySettings.reducedMotion ? 'scale-105 rotate-1' : 'scale-100 rotate-0'}
        ${accessibilitySettings.highContrast ? 'bg-black text-white border-white' : ''}
        hover:scale-105 hover:shadow-xl
        ${accessibilitySettings.reducedMotion ? '' : 'transform'}
      `}>
        
        {/* Card Header */}
        <div className={`p-3 border-b ${
          accessibilitySettings.highContrast ? 'border-white' : 'border-gray-200'
        } bg-gradient-to-r ${word.color} bg-opacity-20`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-medium">
                {word.habitat}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {renderDifficultyStars()}
              <Badge 
                variant="secondary" 
                className={`text-xs font-bold capitalize ${
                  word.rarity === 'mythical' ? 'bg-gradient-to-r from-pink-200 to-purple-200' :
                  word.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-200 to-orange-200' :
                  word.rarity === 'epic' ? 'bg-gradient-to-r from-purple-200 to-indigo-200' :
                  word.rarity === 'rare' ? 'bg-gradient-to-r from-blue-200 to-cyan-200' :
                  'bg-gray-200'
                }`}
              >
                {word.rarity}
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Card Content */}
        <CardContent className="p-6 text-center" onClick={handleCardClick}>
          {/* Emoji Display */}
          <div className={`text-8xl mb-4 transition-transform duration-300 ${
            accessibilitySettings.reducedMotion ? '' : 'group-hover:scale-110'
          } drop-shadow-2xl`}>
            {word.emoji}
          </div>

          {/* Word Display */}
          <h2 className={`font-bold mb-3 drop-shadow-lg tracking-wide ${
            accessibilitySettings.largeText ? 'text-5xl' : 'text-4xl'
          } ${
            accessibilitySettings.highContrast ? 'text-white' : 'text-gray-800'
          }`}>
            {word.word}
          </h2>

          {/* Definition */}
          {showDefinition && (
            <p className={`mb-4 bg-white/80 rounded-xl p-3 backdrop-blur-sm ${
              accessibilitySettings.largeText ? 'text-xl' : 'text-lg'
            } ${
              accessibilitySettings.highContrast ? 'bg-gray-800 text-white' : 'text-gray-700'
            }`}>
              {word.definition}
            </p>
          )}

          {/* Example */}
          {word.example && (
            <p className={`italic mb-4 text-gray-600 ${
              accessibilitySettings.largeText ? 'text-lg' : 'text-base'
            } ${
              accessibilitySettings.highContrast ? 'text-gray-300' : ''
            }`}>
              "{word.example}"
            </p>
          )}

          {/* Fun Fact */}
          {word.funFact && (
            <div className={`bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-3 mb-4 ${
              accessibilitySettings.highContrast ? 'bg-gray-700 text-white' : ''
            }`}>
              <div className={`font-bold mb-1 flex items-center justify-center gap-2 ${
                accessibilitySettings.largeText ? 'text-lg' : 'text-base'
              }`}>
                <span className="text-xl">🤓</span>
                Fun Fact:
              </div>
              <div className={`${
                accessibilitySettings.largeText ? 'text-base' : 'text-sm'
              } ${
                accessibilitySettings.highContrast ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {word.funFact}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-2 flex-wrap">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handlePronounce();
              }}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg"
              size={accessibilitySettings.largeText ? "lg" : "default"}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Say It!
            </Button>

            <Button
              onClick={handleFavorite}
              variant={isFavorited ? "default" : "outline"}
              className={`shadow-lg ${
                isFavorited
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'
                  : 'hover:bg-red-50 hover:text-red-600 border-red-200'
              }`}
              size={accessibilitySettings.largeText ? "lg" : "default"}
            >
              <Heart className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
              {isFavorited ? 'Loved!' : 'Love It'}
            </Button>

            <Button
              onClick={handleMastery}
              variant={isMastered ? "default" : "outline"}
              className={`shadow-lg ${
                isMastered
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                  : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
              }`}
              size={accessibilitySettings.largeText ? "lg" : "default"}
            >
              <Crown className="w-4 h-4 mr-2" />
              {isMastered ? 'Mastered!' : 'Master It'}
            </Button>
          </div>
        </CardContent>

        {/* Status Badges */}
        {isMastered && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            MASTERED
          </div>
        )}

        {isFavorited && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Heart className="w-3 h-3 fill-current" />
            FAVORITE
          </div>
        )}

        {/* Rarity glow effect */}
        {word.rarity === 'mythical' && !accessibilitySettings.reducedMotion && (
          <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-purple-400/20 animate-pulse pointer-events-none" />
        )}
        {word.rarity === 'legendary' && !accessibilitySettings.reducedMotion && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 animate-pulse pointer-events-none" />
        )}
      </Card>
    </div>
  );
};

