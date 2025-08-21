import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { getEmojiPerformanceManager, enableEmojiLazyLoading, disableEmojiLazyLoading } from '@/lib/emojiPerformance';
import { AccessibleEmoji } from './accessible-emoji';
import { useTwemojiEnabled } from '@/hooks/use-twemoji-init';
import { getEmojiAccessibilityAttributes } from '@/lib/emojiAccessibility';

interface LazyEmojiProps {
  emoji: string;
  className?: string;
  size?: number | string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  context?: string;
  interactive?: boolean;
  onClick?: () => void;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  enableIntersectionObserver?: boolean;
}

/**
 * Performance-optimized lazy loading emoji component
 */
export function LazyEmoji({
  emoji,
  className,
  size = 24,
  priority = 'medium',
  placeholder,
  fallback,
  context,
  interactive = false,
  onClick,
  onLoad,
  onError,
  enableIntersectionObserver = true,
}: LazyEmojiProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const elementRef = useRef<HTMLSpanElement>(null);
  const twemojiEnabled = useTwemojiEnabled();
  const performanceManager = getEmojiPerformanceManager();

  // Load emoji when component mounts or becomes visible
  const loadEmoji = useCallback(async () => {
    if (isLoaded || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const isPreload = priority === 'critical' || priority === 'high';
      await performanceManager.loadEmoji(emoji, isPreload);
      
      setIsLoaded(true);
      onLoad?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load emoji');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [emoji, isLoaded, isLoading, priority, performanceManager, onLoad, onError]);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enableIntersectionObserver) return;

    // For critical and high priority emojis, load immediately
    if (priority === 'critical' || priority === 'high') {
      loadEmoji();
      return;
    }

    // Enable lazy loading for medium and low priority emojis
    enableEmojiLazyLoading(element, emoji);

    // Set up custom intersection observer callback
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadEmoji();
            observer.unobserve(element);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before element enters viewport
        threshold: 0.1,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      disableEmojiLazyLoading(element);
    };
  }, [emoji, priority, enableIntersectionObserver, loadEmoji]);

  // Preload critical emojis immediately
  useEffect(() => {
    if (priority === 'critical') {
      loadEmoji();
    }
  }, [priority, loadEmoji]);

  // Get accessibility attributes
  const accessibilityAttributes = getEmojiAccessibilityAttributes(emoji, {}, context);

  // Render placeholder while loading
  if (!isLoaded && !error) {
    const defaultPlaceholder = (
      <div
        className={cn(
          'emoji-placeholder inline-block animate-pulse',
          'bg-gray-200 rounded',
          className
        )}
        style={{
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...accessibilityAttributes}
        aria-label={`Loading ${accessibilityAttributes['aria-label']}`}
      />
    );

    return (
      <span ref={elementRef} className="lazy-emoji-container">
        {placeholder || defaultPlaceholder}
      </span>
    );
  }

  // Render error state
  if (error) {
    const defaultFallback = (
      <span
        className={cn('emoji-error text-gray-400', className)}
        title={`Failed to load emoji: ${emoji}`}
        {...accessibilityAttributes}
      >
        {emoji}
      </span>
    );

    return (
      <span ref={elementRef} className="lazy-emoji-container">
        {fallback || defaultFallback}
      </span>
    );
  }

  // Render loaded emoji
  return (
    <span ref={elementRef} className="lazy-emoji-container">
      <AccessibleEmoji
        emoji={emoji}
        className={cn('lazy-emoji-loaded', className)}
        size={size}
        context={context}
        interactive={interactive}
        onClick={onClick}
        useTwemoji={twemojiEnabled}
      />
    </span>
  );
}

/**
 * Specialized lazy loading components for different contexts
 */

interface LazyJungleNavEmojiProps {
  animal: 'owl' | 'parrot' | 'monkey' | 'elephant';
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  size?: number;
}

export function LazyJungleNavEmoji({
  animal,
  label,
  isActive = false,
  onClick,
  className,
  size = 24,
}: LazyJungleNavEmojiProps) {
  const emojiMap = {
    owl: '🦉',
    parrot: '🦜',
    monkey: '🐵',
    elephant: '🐘',
  };

  const emoji = emojiMap[animal];

  return (
    <LazyEmoji
      emoji={emoji}
      size={size}
      priority="critical" // Navigation emojis are critical
      context={`${label} navigation`}
      interactive={!!onClick}
      onClick={onClick}
      className={cn(
        'jungle-nav-emoji transition-transform duration-200',
        isActive && 'scale-110 ring-2 ring-white/50',
        className
      )}
      placeholder={
        <div
          className={cn(
            'nav-emoji-placeholder rounded-full bg-gradient-to-br from-green-400 to-green-600',
            'animate-pulse',
            className
          )}
          style={{ width: size, height: size }}
          aria-label={`Loading ${label} navigation`}
        />
      }
    />
  );
}

interface LazyAchievementEmojiProps {
  emoji: string;
  achievementName: string;
  isUnlocked?: boolean;
  priority?: 'high' | 'medium' | 'low';
  onClick?: () => void;
  className?: string;
  size?: number;
}

export function LazyAchievementEmoji({
  emoji,
  achievementName,
  isUnlocked = false,
  priority = 'medium',
  onClick,
  className,
  size = 32,
}: LazyAchievementEmojiProps) {
  return (
    <LazyEmoji
      emoji={emoji}
      size={size}
      priority={isUnlocked ? 'high' : priority} // Prioritize unlocked achievements
      context={`${achievementName} achievement`}
      interactive={!!onClick}
      onClick={onClick}
      className={cn(
        'achievement-emoji transition-all duration-300',
        isUnlocked ? 'filter-none' : 'filter grayscale opacity-50',
        className
      )}
      placeholder={
        <div
          className={cn(
            'achievement-placeholder rounded-lg bg-gradient-to-br',
            isUnlocked 
              ? 'from-yellow-400 to-yellow-600' 
              : 'from-gray-300 to-gray-400',
            'animate-pulse',
            className
          )}
          style={{ width: size, height: size }}
          aria-label={`Loading ${achievementName} achievement`}
        />
      }
    />
  );
}

/**
 * Emoji grid with progressive loading
 */
interface LazyEmojiGridProps {
  emojis: Array<{
    emoji: string;
    label: string;
    priority?: 'critical' | 'high' | 'medium' | 'low';
    onClick?: () => void;
  }>;
  columns?: number;
  gap?: number;
  size?: number;
  className?: string;
  loadingStrategy?: 'immediate' | 'progressive' | 'viewport';
}

export function LazyEmojiGrid({
  emojis,
  columns = 4,
  gap = 8,
  size = 32,
  className,
  loadingStrategy = 'progressive',
}: LazyEmojiGridProps) {
  const [visibleCount, setVisibleCount] = useState(
    loadingStrategy === 'immediate' ? emojis.length : Math.min(8, emojis.length)
  );

  // Progressive loading - load more emojis gradually
  useEffect(() => {
    if (loadingStrategy !== 'progressive' || visibleCount >= emojis.length) return;

    const timer = setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 4, emojis.length));
    }, 500); // Load 4 more every 500ms

    return () => clearTimeout(timer);
  }, [visibleCount, emojis.length, loadingStrategy]);

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap}px`,
  };

  return (
    <div
      className={cn('lazy-emoji-grid', className)}
      style={gridStyle}
      role="grid"
      aria-label="Emoji grid"
    >
      {emojis.slice(0, visibleCount).map((item, index) => (
        <div
          key={`${item.emoji}-${index}`}
          role="gridcell"
          className="emoji-grid-cell"
        >
          <LazyEmoji
            emoji={item.emoji}
            size={size}
            priority={item.priority || 'medium'}
            context={item.label}
            interactive={!!item.onClick}
            onClick={item.onClick}
            enableIntersectionObserver={loadingStrategy === 'viewport'}
            className="emoji-grid-item"
          />
        </div>
      ))}
      
      {/* Show loading indicators for remaining items */}
      {visibleCount < emojis.length && loadingStrategy === 'progressive' && (
        <>
          {Array.from({ length: Math.min(4, emojis.length - visibleCount) }).map((_, index) => (
            <div
              key={`placeholder-${index}`}
              className="emoji-grid-placeholder animate-pulse bg-gray-200 rounded"
              style={{ width: size, height: size }}
            />
          ))}
        </>
      )}
    </div>
  );
}

/**
 * Virtualized emoji list for large collections
 */
interface VirtualizedEmojiListProps {
  emojis: Array<{
    emoji: string;
    label: string;
    onClick?: () => void;
  }>;
  itemHeight: number;
  containerHeight: number;
  size?: number;
  className?: string;
}

export function VirtualizedEmojiList({
  emojis,
  itemHeight,
  containerHeight,
  size = 24,
  className,
}: VirtualizedEmojiListProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleItemsCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleItemsCount + 1, emojis.length);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  const totalHeight = emojis.length * itemHeight;
  const visibleItems = emojis.slice(startIndex, endIndex);

  return (
    <div
      ref={containerRef}
      className={cn('virtualized-emoji-list overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      role="listbox"
      aria-label="Virtualized emoji list"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => {
          const actualIndex = startIndex + index;
          return (
            <div
              key={`${item.emoji}-${actualIndex}`}
              className="virtualized-emoji-item flex items-center p-2"
              style={{
                position: 'absolute',
                top: actualIndex * itemHeight,
                height: itemHeight,
                width: '100%',
              }}
              role="option"
            >
              <LazyEmoji
                emoji={item.emoji}
                size={size}
                priority="low" // Virtualized items are lower priority
                context={item.label}
                interactive={!!item.onClick}
                onClick={item.onClick}
                className="mr-2"
              />
              <span className="emoji-label">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
