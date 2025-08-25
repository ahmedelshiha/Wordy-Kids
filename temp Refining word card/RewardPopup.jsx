// Reward popup component
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Star, 
  Gem, 
  Crown, 
  Sparkles,
  X,
  Lock,
  Unlock
} from 'lucide-react';
import { audioService } from '../lib/audioService';

export const RewardPopup = ({
  isOpen,
  onClose,
  rewardData,
  accessibilitySettings
}) => {
  const [particles, setParticles] = useState([]);
  const [animationClass, setAnimationClass] = useState('');

  // Create particle effects
  useEffect(() => {
    if (isOpen && !accessibilitySettings.reducedMotion) {
      createParticles();
      setAnimationClass('animate-bounce');
      
      // Play sound
      if (accessibilitySettings.soundEnabled) {
        if (rewardData?.type === 'word_mastered') {
          audioService.playSound('celebration');
        } else if (rewardData?.type === 'badge_earned') {
          audioService.playSound('sparkle');
        } else if (rewardData?.type === 'category_completed') {
          audioService.playSound('celebration');
        }
      }
      
      // Reset animation after a delay
      const timer = setTimeout(() => {
        setAnimationClass('');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, accessibilitySettings.reducedMotion, accessibilitySettings.soundEnabled, rewardData]);

  // Create particles
  const createParticles = () => {
    const newParticles = [];
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: Math.random(),
        emoji: ['✨', '🌟', '💫', '🎉', '🎊', '💎'][Math.floor(Math.random() * 6)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2
      });
    }
    
    setParticles(newParticles);
  };

  if (!isOpen || !rewardData) return null;

  // Render different content based on reward type
  const renderRewardContent = () => {
    switch (rewardData.type) {
      case 'word_mastered':
        return (
          <>
            <div className={`text-6xl mb-4 ${animationClass}`}>🏆</div>
            <h2 className={`font-bold mb-2 ${
              accessibilitySettings.largeText ? 'text-3xl' : 'text-2xl'
            }`}>
              Word Mastered!
            </h2>
            <p className="text-gray-600 mb-6">
              Great job! You've mastered a new jungle word.
            </p>
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 bg-green-100 rounded-full p-3 mb-2">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-sm font-medium">+25 Points</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 bg-blue-100 rounded-full p-3 mb-2">
                  <Gem className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-sm font-medium">+1 Jungle Gem</div>
              </div>
            </div>
          </>
        );
        
      case 'badge_earned':
        return (
          <>
            <div className={`text-6xl mb-4 ${animationClass}`}>🏅</div>
            <h2 className={`font-bold mb-2 ${
              accessibilitySettings.largeText ? 'text-3xl' : 'text-2xl'
            }`}>
              New Badge Earned!
            </h2>
            <p className="text-gray-600 mb-6">
              {rewardData.badgeName || 'Explorer Badge'}
            </p>
            <div className="flex items-center justify-center mb-6">
              <div className="text-center">
                <div className={`flex items-center justify-center gap-2 rounded-full p-4 mb-3 ${
                  rewardData.badgeColor || 'bg-gradient-to-r from-yellow-300 to-orange-400'
                }`}>
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div className="font-medium">{rewardData.badgeDescription || 'Keep exploring!'}</div>
              </div>
            </div>
          </>
        );
        
      case 'category_completed':
        return (
          <>
            <div className={`text-6xl mb-4 ${animationClass}`}>🎉</div>
            <h2 className={`font-bold mb-2 ${
              accessibilitySettings.largeText ? 'text-3xl' : 'text-2xl'
            }`}>
              Category Completed!
            </h2>
            <p className="text-gray-600 mb-6">
              You've mastered all words in the {rewardData.categoryName || 'category'}!
            </p>
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 bg-purple-100 rounded-full p-3 mb-2">
                  <Crown className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-sm font-medium">Category Master</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 bg-yellow-100 rounded-full p-3 mb-2">
                  <Sparkles className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="text-sm font-medium">+3 Sparkle Seeds</div>
              </div>
            </div>
          </>
        );
        
      case 'category_locked':
        return (
          <>
            <div className={`text-6xl mb-4`}>🔒</div>
            <h2 className={`font-bold mb-2 ${
              accessibilitySettings.largeText ? 'text-3xl' : 'text-2xl'
            }`}>
              Area Locked
            </h2>
            <p className="text-gray-600 mb-6">
              This jungle area is still locked! Keep exploring to unlock it.
            </p>
            <div className="flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 bg-gray-100 rounded-full p-4 mb-3">
                  <Lock className="w-8 h-8 text-gray-600" />
                </div>
                <div className="font-medium">Master more words to unlock new areas!</div>
              </div>
            </div>
          </>
        );
        
      default:
        return (
          <>
            <div className="text-6xl mb-4">🌟</div>
            <h2 className={`font-bold mb-2 ${
              accessibilitySettings.largeText ? 'text-3xl' : 'text-2xl'
            }`}>
              Great Job!
            </h2>
            <p className="text-gray-600 mb-6">
              Keep exploring the jungle!
            </p>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
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
      
      <div className={`relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center ${
        accessibilitySettings.highContrast ? 'bg-black text-white border border-white' : ''
      }`}>
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-2 right-2 h-8 w-8"
          aria-label="Close popup"
        >
          <X className="w-4 h-4" />
        </Button>
        
        {/* Reward content */}
        {renderRewardContent()}
        
        {/* Action button */}
        <Button
          onClick={onClose}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8"
        >
          Continue Adventure
        </Button>
      </div>
    </div>
  );
};

