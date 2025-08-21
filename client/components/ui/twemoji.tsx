import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TwemojiProps {
  emoji: string;
  className?: string;
  size?: number | string;
  ariaLabel?: string;
  fallback?: React.ReactNode;
}

/**
 * Converts emoji characters to their Unicode codepoints for Twemoji filename
 */
function emojiToCodepoint(emoji: string): string {
  return Array.from(emoji)
    .map(char => char.codePointAt(0)?.toString(16).toLowerCase())
    .filter(Boolean)
    .join('-');
}

/**
 * TwemojiSVG component renders emoji as SVG images using Twemoji assets
 * Provides consistent cross-platform emoji appearance
 */
export function TwemojiSVG({ 
  emoji, 
  className, 
  size = 24, 
  ariaLabel,
  fallback 
}: TwemojiProps) {
  const codepoint = useMemo(() => emojiToCodepoint(emoji), [emoji]);
  
  // Twemoji CDN URL for SVG
  const svgUrl = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codepoint}.svg`;
  
  // Local fallback URL
  const localUrl = `/emoji/${codepoint}.svg`;
  
  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    // Try local fallback first, then show fallback content
    const img = event.currentTarget;
    if (img.src === svgUrl) {
      img.src = localUrl;
    } else if (fallback) {
      // Hide the img and show fallback
      img.style.display = 'none';
      const parent = img.parentElement;
      if (parent && !parent.querySelector('.twemoji-fallback')) {
        const fallbackElement = document.createElement('span');
        fallbackElement.className = 'twemoji-fallback emoji-inline';
        fallbackElement.textContent = emoji;
        parent.appendChild(fallbackElement);
      }
    }
  };

  return (
    <img
      src={svgUrl}
      alt={ariaLabel || `Emoji: ${emoji}`}
      className={cn(
        'twemoji inline-block align-middle',
        'select-none pointer-events-none',
        className
      )}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
      }}
      onError={handleError}
      loading="lazy"
      decoding="async"
    />
  );
}

/**
 * Specialized Twemoji components for jungle navigation
 */
export const JungleNavTwemoji = {
  Owl: ({ className, size = 24, ariaLabel = "Wise Owl" }: Omit<TwemojiProps, 'emoji'>) => (
    <TwemojiSVG 
      emoji="🦉" 
      className={cn('jungle-nav-twemoji', className)}
      size={size}
      ariaLabel={ariaLabel}
    />
  ),
  
  Parrot: ({ className, size = 24, ariaLabel = "Smart Parrot" }: Omit<TwemojiProps, 'emoji'>) => (
    <TwemojiSVG 
      emoji="🦜" 
      className={cn('jungle-nav-twemoji', className)}
      size={size}
      ariaLabel={ariaLabel}
    />
  ),
  
  Monkey: ({ className, size = 24, ariaLabel = "Playful Monkey" }: Omit<TwemojiProps, 'emoji'>) => (
    <TwemojiSVG 
      emoji="🐵" 
      className={cn('jungle-nav-twemoji', className)}
      size={size}
      ariaLabel={ariaLabel}
    />
  ),
  
  Elephant: ({ className, size = 24, ariaLabel = "Majestic Elephant" }: Omit<TwemojiProps, 'emoji'>) => (
    <TwemojiSVG 
      emoji="🐘" 
      className={cn('jungle-nav-twemoji', className)}
      size={size}
      ariaLabel={ariaLabel}
    />
  ),
};

/**
 * Common achievement and game Twemoji components
 */
export const AchievementTwemoji = {
  Trophy: ({ className, size = 32 }: Omit<TwemojiProps, 'emoji' | 'ariaLabel'>) => (
    <TwemojiSVG 
      emoji="🏆" 
      className={cn('achievement-twemoji', className)}
      size={size}
      ariaLabel="Trophy Achievement"
    />
  ),
  
  Star: ({ className, size = 24 }: Omit<TwemojiProps, 'emoji' | 'ariaLabel'>) => (
    <TwemojiSVG 
      emoji="🌟" 
      className={cn('achievement-twemoji', className)}
      size={size}
      ariaLabel="Star Achievement"
    />
  ),
  
  Crown: ({ className, size = 32 }: Omit<TwemojiProps, 'emoji' | 'ariaLabel'>) => (
    <TwemojiSVG 
      emoji="👑" 
      className={cn('achievement-twemoji', className)}
      size={size}
      ariaLabel="Crown Achievement"
    />
  ),
  
  Diamond: ({ className, size = 24 }: Omit<TwemojiProps, 'emoji' | 'ariaLabel'>) => (
    <TwemojiSVG 
      emoji="💎" 
      className={cn('achievement-twemoji', className)}
      size={size}
      ariaLabel="Diamond Achievement"
    />
  ),
};

/**
 * Game-specific Twemoji components
 */
export const GameTwemoji = {
  Target: ({ className, size = 24 }: Omit<TwemojiProps, 'emoji' | 'ariaLabel'>) => (
    <TwemojiSVG 
      emoji="🎯" 
      className={cn('game-twemoji', className)}
      size={size}
      ariaLabel="Target Game"
    />
  ),
  
  Rocket: ({ className, size = 24 }: Omit<TwemojiProps, 'emoji' | 'ariaLabel'>) => (
    <TwemojiSVG 
      emoji="🚀" 
      className={cn('game-twemoji', className)}
      size={size}
      ariaLabel="Rocket Game"
    />
  ),
  
  Brain: ({ className, size = 24 }: Omit<TwemojiProps, 'emoji' | 'ariaLabel'>) => (
    <TwemojiSVG 
      emoji="🧠" 
      className={cn('game-twemoji', className)}
      size={size}
      ariaLabel="Brain Game"
    />
  ),
  
  Book: ({ className, size = 24 }: Omit<TwemojiProps, 'emoji' | 'ariaLabel'>) => (
    <TwemojiSVG 
      emoji="📚" 
      className={cn('game-twemoji', className)}
      size={size}
      ariaLabel="Book Learning"
    />
  ),
};

/**
 * Responsive Twemoji wrapper that adjusts size based on screen size
 */
export function ResponsiveTwemoji({ 
  emoji, 
  className, 
  ariaLabel,
  mobileSize = 20,
  tabletSize = 24,
  desktopSize = 28
}: TwemojiProps & {
  mobileSize?: number;
  tabletSize?: number;
  desktopSize?: number;
}) {
  return (
    <div className={cn('responsive-twemoji', className)}>
      <TwemojiSVG
        emoji={emoji}
        ariaLabel={ariaLabel}
        className="block sm:hidden"
        size={mobileSize}
      />
      <TwemojiSVG
        emoji={emoji}
        ariaLabel={ariaLabel}
        className="hidden sm:block lg:hidden"
        size={tabletSize}
      />
      <TwemojiSVG
        emoji={emoji}
        ariaLabel={ariaLabel}
        className="hidden lg:block"
        size={desktopSize}
      />
    </div>
  );
}

/**
 * Animated Twemoji with hover effects
 */
export function AnimatedTwemoji({
  emoji,
  className,
  size = 24,
  ariaLabel,
  animation = 'hover-bounce'
}: TwemojiProps & {
  animation?: 'hover-bounce' | 'hover-rotate' | 'hover-scale' | 'pulse';
}) {
  const animationClasses = {
    'hover-bounce': 'hover:animate-bounce',
    'hover-rotate': 'hover:rotate-12',
    'hover-scale': 'hover:scale-110',
    'pulse': 'animate-pulse',
  };

  return (
    <div className={cn(
      'transition-transform duration-300 ease-in-out',
      animationClasses[animation],
      className
    )}>
      <TwemojiSVG
        emoji={emoji}
        size={size}
        ariaLabel={ariaLabel}
      />
    </div>
  );
}

/**
 * Fallback component for when Twemoji fails to load
 */
export function TwemojiFallback({ 
  emoji, 
  className, 
  size = 24 
}: {
  emoji: string;
  className?: string;
  size?: number | string;
}) {
  return (
    <span 
      className={cn(
        'emoji-fallback inline-block text-center',
        'bg-gray-100 rounded border border-gray-200',
        'text-gray-600 font-medium',
        className
      )}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        lineHeight: typeof size === 'number' ? `${size}px` : size,
        fontSize: typeof size === 'number' ? `${size * 0.7}px` : '14px',
      }}
    >
      {emoji}
    </span>
  );
}
