import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  getEmojiAccessibilityAttributes, 
  getAccessibilitySettings,
  navigationAccessibility,
  achievementAccessibility,
  type EmojiAccessibilityConfig 
} from '@/lib/emojiAccessibility';
import { TwemojiSVG } from './twemoji';
import { useTwemojiEnabled } from '@/hooks/use-twemoji-init';

interface AccessibleEmojiProps {
  emoji: string;
  className?: string;
  size?: number | string;
  context?: string;
  interactive?: boolean;
  accessibilityConfig?: Partial<EmojiAccessibilityConfig>;
  onClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  useTwemoji?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Fully accessible emoji component with comprehensive ARIA support
 */
export const AccessibleEmoji = forwardRef<HTMLSpanElement, AccessibleEmojiProps>(
  ({ 
    emoji, 
    className, 
    size, 
    context, 
    interactive = false,
    accessibilityConfig = {},
    onClick,
    onKeyDown,
    useTwemoji,
    fallback,
    ...props 
  }, ref) => {
    const twemojiEnabled = useTwemojiEnabled();
    const shouldUseTwemoji = useTwemoji !== undefined ? useTwemoji : twemojiEnabled;
    const accessibilitySettings = getAccessibilitySettings();
    
    // Get comprehensive accessibility attributes
    const accessibilityAttributes = getEmojiAccessibilityAttributes(
      emoji,
      accessibilityConfig,
      context
    );

    // Handle keyboard interaction for interactive emojis
    const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
      if (interactive && onClick && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onClick();
      }
      onKeyDown?.(event);
    };

    // Determine component classes
    const componentClasses = cn(
      'accessible-emoji',
      interactive && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      accessibilitySettings.reducedMotion && 'motion-reduce',
      accessibilitySettings.highContrast && 'high-contrast',
      className
    );

    // Size styling
    const sizeStyles = size ? {
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      fontSize: typeof size === 'number' ? `${size * 0.8}px` : undefined,
    } : undefined;

    // Common props for both Twemoji and regular emoji
    const commonProps = {
      ref,
      className: componentClasses,
      style: sizeStyles,
      onClick: interactive ? onClick : undefined,
      onKeyDown: interactive ? handleKeyDown : undefined,
      tabIndex: interactive ? 0 : undefined,
      'data-emoji': emoji,
      'data-accessible': 'true',
      ...accessibilityAttributes,
      ...props,
    };

    // Render Twemoji if enabled and supported
    if (shouldUseTwemoji) {
      return (
        <span {...commonProps}>
          <TwemojiSVG
            emoji={emoji}
            size={size}
            ariaLabel={accessibilityAttributes['aria-label']}
            fallback={fallback || <span>{emoji}</span>}
          />
        </span>
      );
    }

    // Fallback to regular emoji
    return (
      <span {...commonProps}>
        {emoji}
      </span>
    );
  }
);

AccessibleEmoji.displayName = 'AccessibleEmoji';

/**
 * Specialized accessible components for different contexts
 */

interface JungleNavEmojiProps {
  animal: 'owl' | 'parrot' | 'monkey' | 'elephant';
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  size?: number;
}

export function AccessibleJungleNavEmoji({
  animal,
  label,
  isActive = false,
  onClick,
  className,
  size = 24,
}: JungleNavEmojiProps) {
  const emojiMap = {
    owl: '🦉',
    parrot: '🦜',
    monkey: '🐵',
    elephant: '🐘',
  };

  const emoji = emojiMap[animal];
  const navAttributes = navigationAccessibility.getNavItemAttributes(animal, label);

  return (
    <AccessibleEmoji
      emoji={emoji}
      size={size}
      context={`${label} navigation`}
      interactive={!!onClick}
      onClick={onClick}
      className={cn(
        'jungle-nav-emoji transition-transform duration-200',
        isActive && 'scale-110 ring-2 ring-white/50',
        className
      )}
      accessibilityConfig={{
        includeAriaLabel: true,
        includeRole: true,
        includeTitle: true,
        customDescription: navAttributes['aria-label'],
      }}
    />
  );
}

interface AccessibleAchievementEmojiProps {
  emoji: string;
  achievementName: string;
  isUnlocked?: boolean;
  onClick?: () => void;
  className?: string;
  size?: number;
  showTooltip?: boolean;
}

export function AccessibleAchievementEmoji({
  emoji,
  achievementName,
  isUnlocked = false,
  onClick,
  className,
  size = 32,
  showTooltip = true,
}: AccessibleAchievementEmojiProps) {
  const achievementAttributes = achievementAccessibility.getAchievementAttributes(emoji, achievementName);

  return (
    <AccessibleEmoji
      emoji={emoji}
      size={size}
      context={isUnlocked ? 'unlocked achievement' : 'locked achievement'}
      interactive={!!onClick}
      onClick={onClick}
      className={cn(
        'achievement-emoji transition-all duration-300',
        isUnlocked ? 'filter-none' : 'filter grayscale opacity-50',
        showTooltip && 'group relative',
        className
      )}
      accessibilityConfig={{
        includeAriaLabel: true,
        includeRole: true,
        includeTitle: true,
        customDescription: achievementAttributes['aria-label'],
      }}
    />
  );
}

interface AccessibleGameEmojiProps {
  emoji: string;
  gameName: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  size?: number;
  disabled?: boolean;
}

export function AccessibleGameEmoji({
  emoji,
  gameName,
  isActive = false,
  onClick,
  className,
  size = 24,
  disabled = false,
}: AccessibleGameEmojiProps) {
  return (
    <AccessibleEmoji
      emoji={emoji}
      size={size}
      context={`${gameName} game`}
      interactive={!disabled && !!onClick}
      onClick={disabled ? undefined : onClick}
      className={cn(
        'game-emoji transition-transform duration-200',
        isActive && 'scale-110',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'hover:scale-105',
        className
      )}
      accessibilityConfig={{
        includeAriaLabel: true,
        includeRole: true,
        includeTitle: true,
        customDescription: `${gameName} game ${disabled ? '(disabled)' : '(clickable)'}`,
      }}
    />
  );
}

/**
 * Accessible emoji list with proper navigation support
 */
interface AccessibleEmojiListProps {
  emojis: Array<{
    emoji: string;
    label: string;
    onClick?: () => void;
  }>;
  className?: string;
  size?: number;
  orientation?: 'horizontal' | 'vertical';
  enableKeyboardNavigation?: boolean;
}

export function AccessibleEmojiList({
  emojis,
  className,
  size = 24,
  orientation = 'horizontal',
  enableKeyboardNavigation = true,
}: AccessibleEmojiListProps) {
  const [focusedIndex, setFocusedIndex] = React.useState(0);
  
  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (!enableKeyboardNavigation) return;

    const isHorizontal = orientation === 'horizontal';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';

    switch (event.key) {
      case nextKey:
        event.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % emojis.length);
        break;
      case prevKey:
        event.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + emojis.length) % emojis.length);
        break;
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setFocusedIndex(emojis.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        emojis[index]?.onClick?.();
        break;
    }
  };

  return (
    <div
      className={cn(
        'accessible-emoji-list',
        orientation === 'horizontal' ? 'flex items-center gap-2' : 'flex flex-col gap-2',
        className
      )}
      role="toolbar"
      aria-label="Emoji selection"
      aria-orientation={orientation}
    >
      {emojis.map((item, index) => (
        <AccessibleEmoji
          key={`${item.emoji}-${index}`}
          emoji={item.emoji}
          size={size}
          context={item.label}
          interactive={!!item.onClick}
          onClick={item.onClick}
          onKeyDown={(event) => handleKeyDown(event, index)}
          className={cn(
            'emoji-list-item',
            focusedIndex === index && enableKeyboardNavigation && 'ring-2 ring-blue-500'
          )}
          accessibilityConfig={{
            includeAriaLabel: true,
            includeRole: true,
            customDescription: item.label,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Screen reader announcement component for emoji changes
 */
interface EmojiAnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive';
}

export function EmojiAnnouncement({ message, priority = 'polite' }: EmojiAnnouncementProps) {
  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {message}
    </div>
  );
}

/**
 * Accessible emoji tooltip component
 */
interface AccessibleEmojiTooltipProps {
  emoji: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export function AccessibleEmojiTooltip({
  emoji,
  description,
  children,
  className,
}: AccessibleEmojiTooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const accessibilitySettings = getAccessibilitySettings();

  // Don't show visual tooltips for screen reader users
  if (accessibilitySettings.screenReader) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn('relative inline-block', className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                     px-2 py-1 text-sm text-white bg-gray-900 rounded 
                     shadow-lg z-50 whitespace-nowrap"
          role="tooltip"
          aria-hidden="true"
        >
          <AccessibleEmoji emoji={emoji} size={16} className="inline mr-1" />
          {description}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 
                         w-0 h-0 border-l-4 border-r-4 border-t-4 
                         border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}
