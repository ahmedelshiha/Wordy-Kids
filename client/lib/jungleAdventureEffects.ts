/**
 * Jungle Adventure Theme Effects
 * Provides jungle-themed animations, confetti, and interactive effects for kids
 */

import confetti from 'canvas-confetti';

export interface JungleCollectible {
  id: string;
  type: 'sticker' | 'gem' | 'fruit';
  emoji: string;
  name: string;
  rarity: 'common' | 'rare' | 'legendary';
  points: number;
}

export const JUNGLE_COLLECTIBLES: JungleCollectible[] = [
  // Stickers (common)
  { id: 'monkey_sticker', type: 'sticker', emoji: '🐵', name: 'Monkey Sticker', rarity: 'common', points: 10 },
  { id: 'parrot_sticker', type: 'sticker', emoji: '🦜', name: 'Parrot Sticker', rarity: 'common', points: 10 },
  { id: 'tiger_sticker', type: 'sticker', emoji: '🐅', name: 'Tiger Sticker', rarity: 'common', points: 10 },
  { id: 'elephant_sticker', type: 'sticker', emoji: '🐘', name: 'Elephant Sticker', rarity: 'common', points: 10 },
  
  // Gems (rare)
  { id: 'emerald_gem', type: 'gem', emoji: '💎', name: 'Emerald Gem', rarity: 'rare', points: 25 },
  { id: 'ruby_gem', type: 'gem', emoji: '💍', name: 'Ruby Gem', rarity: 'rare', points: 25 },
  { id: 'sapphire_gem', type: 'gem', emoji: '🔷', name: 'Sapphire Gem', rarity: 'rare', points: 25 },
  
  // Jungle Fruits (legendary)
  { id: 'golden_banana', type: 'fruit', emoji: '🍌', name: 'Golden Banana', rarity: 'legendary', points: 50 },
  { id: 'magic_coconut', type: 'fruit', emoji: '🥥', name: 'Magic Coconut', rarity: 'legendary', points: 50 },
  { id: 'rainbow_mango', type: 'fruit', emoji: '🥭', name: 'Rainbow Mango', rarity: 'legendary', points: 50 },
];

export const JUNGLE_SOUNDS = {
  // Success sounds
  correct_answer: 'https://www.soundjay.com/misc/sounds/ding.wav',
  level_up: 'https://www.soundjay.com/misc/sounds/fanfare.wav',
  collectible_found: 'https://www.soundjay.com/misc/sounds/chime.wav',
  
  // Error sounds
  wrong_answer: 'https://www.soundjay.com/misc/sounds/incorrect.wav',
  
  // Ambient jungle sounds
  jungle_ambient: 'https://www.soundjay.com/nature/sounds/jungle.wav',
  bird_chirp: 'https://www.soundjay.com/animals/sounds/bird.wav',
} as const;

/**
 * Celebration Confetti Effects
 */
export const jungleConfetti = {
  // Basic success confetti
  celebrate: () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']
    });
  },

  // Jungle-themed confetti
  jungleSuccess: () => {
    const emojis = ['🌿', '🍃', '🌺', '🦋', '🐒', '🦜', '🌈'];
    
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      shapes: ['square'],
      colors: ['#22C55E', '#84CC16', '#FCD34D', '#FB923C']
    });

    // Add emoji confetti
    setTimeout(() => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        emojis.forEach((emoji, i) => {
          setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = -50;
            createFallingEmoji(emoji, x, y);
          }, i * 100);
        });
      }
    }, 200);
  },

  // Collectible found celebration
  collectibleFound: (collectible: JungleCollectible) => {
    // Special confetti based on rarity
    const config = {
      common: { count: 50, colors: ['#10B981', '#22C55E'] },
      rare: { count: 80, colors: ['#8B5CF6', '#A855F7', '#C084FC'] },
      legendary: { count: 120, colors: ['#F59E0B', '#FCD34D', '#FBBF24'] }
    };

    const { count, colors } = config[collectible.rarity];

    confetti({
      particleCount: count,
      spread: 90,
      origin: { y: 0.5 },
      colors,
      shapes: ['star', 'circle']
    });

    // Create floating collectible animation
    createFloatingCollectible(collectible);
  },

  // Wrong answer gentle effect
  oopsEffect: () => {
    // Gentle shake effect instead of harsh feedback
    document.body.style.animation = 'gentle-shake 0.5s ease-in-out';
    setTimeout(() => {
      document.body.style.animation = '';
    }, 500);
  }
};

/**
 * Jungle Theme Utilities
 */
export const jungleTheme = {
  // Get random jungle background
  getRandomJungleGradient: () => {
    const gradients = [
      'bg-gradient-to-br from-green-400 via-emerald-400 to-green-600',
      'bg-gradient-to-tr from-lime-400 via-green-400 to-emerald-600',
      'bg-gradient-to-bl from-emerald-300 via-green-400 to-teal-600',
      'bg-gradient-to-tl from-green-300 via-lime-400 to-green-500',
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  },

  // Get jungle zone theme
  getZoneTheme: (zone: 'quiz' | 'progress' | 'library' | 'map') => {
    const themes = {
      quiz: {
        bg: 'bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600',
        accent: 'from-yellow-400 to-orange-500',
        text: 'text-white'
      },
      progress: {
        bg: 'bg-gradient-to-tr from-lime-400 via-green-400 to-emerald-500',
        accent: 'from-blue-400 to-purple-500',
        text: 'text-green-900'
      },
      library: {
        bg: 'bg-gradient-to-bl from-teal-400 via-green-400 to-emerald-500',
        accent: 'from-pink-400 to-purple-500',
        text: 'text-emerald-900'
      },
      map: {
        bg: 'bg-gradient-to-tl from-amber-400 via-yellow-400 to-orange-500',
        accent: 'from-red-400 to-pink-500',
        text: 'text-orange-900'
      }
    };
    return themes[zone];
  }
};

/**
 * Animation Helpers
 */
function createFallingEmoji(emoji: string, x: number, y: number) {
  const element = document.createElement('div');
  element.textContent = emoji;
  element.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    font-size: 24px;
    pointer-events: none;
    z-index: 1000;
    animation: fall-and-fade 3s ease-out forwards;
  `;
  document.body.appendChild(element);
  
  setTimeout(() => {
    element.remove();
  }, 3000);
}

function createFloatingCollectible(collectible: JungleCollectible) {
  const element = document.createElement('div');
  element.innerHTML = `
    <div class="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border-2 border-yellow-300">
      <span class="text-2xl">${collectible.emoji}</span>
      <div>
        <div class="font-bold text-sm text-green-800">${collectible.name}</div>
        <div class="text-xs text-green-600">+${collectible.points} points!</div>
      </div>
    </div>
  `;
  
  element.style.cssText = `
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    animation: collectible-found 2s ease-out forwards;
  `;
  
  document.body.appendChild(element);
  
  setTimeout(() => {
    element.remove();
  }, 2000);
}

/**
 * Random Collectible Generator
 */
export function getRandomCollectible(): JungleCollectible {
  const rand = Math.random();
  
  // 60% common, 30% rare, 10% legendary
  let availableCollectibles;
  if (rand < 0.6) {
    availableCollectibles = JUNGLE_COLLECTIBLES.filter(c => c.rarity === 'common');
  } else if (rand < 0.9) {
    availableCollectibles = JUNGLE_COLLECTIBLES.filter(c => c.rarity === 'rare');
  } else {
    availableCollectibles = JUNGLE_COLLECTIBLES.filter(c => c.rarity === 'legendary');
  }
  
  return availableCollectibles[Math.floor(Math.random() * availableCollectibles.length)];
}

/**
 * Mascot Animation States
 */
export const mascotStates = {
  idle: '🦜',
  happy: '🎉',
  celebrating: '🥳',
  thinking: '🤔',
  encouraging: '💪',
  sleeping: '😴'
};

export function getMascotForState(state: keyof typeof mascotStates): string {
  return mascotStates[state];
}
