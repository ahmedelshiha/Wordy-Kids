// Enhanced Checkbox Component for Educational Applications
// Extends base Checkbox with animations, sounds, and child-friendly features

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField, FormFieldProps } from './FormField';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Circle,
  Star,
  Heart,
  Zap,
  Sparkles,
  Crown,
  Award,
  Volume2,
  VolumeX,
} from 'lucide-react';

export interface EnhancedCheckboxProps extends Omit<FormFieldProps, 'children'> {
  // Basic checkbox props
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  
  // Label and content
  label: string;
  sublabel?: string;
  image?: string;
  emoji?: string;
  icon?: React.ComponentType<{ className?: string }>;
  
  // Enhanced features
  variant?: 'default' | 'card' | 'button' | 'image';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'jungle' | 'ocean' | 'space' | 'rainbow' | 'custom';
  
  // Educational features
  pronounceLabel?: boolean;
  showPoints?: boolean;
  points?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  
  // Child-friendly features
  celebrationAnimation?: boolean;
  successSound?: boolean;
  funMode?: boolean;
  emojiReaction?: boolean;
  
  // Gamification
  unlockable?: boolean;
  locked?: boolean;
  requirement?: string;
  badge?: string;
  
  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const sizeStyles = {
  sm: {
    container: 'p-2',
    checkbox: 'w-4 h-4',
    label: 'text-sm',
    sublabel: 'text-xs',
    emoji: 'text-base',
  },
  md: {
    container: 'p-3',
    checkbox: 'w-5 h-5',
    label: 'text-base',
    sublabel: 'text-sm',
    emoji: 'text-lg',
  },
  lg: {
    container: 'p-4',
    checkbox: 'w-6 h-6',
    label: 'text-lg',
    sublabel: 'text-base',
    emoji: 'text-xl',
  },
  xl: {
    container: 'p-6',
    checkbox: 'w-8 h-8',
    label: 'text-xl',
    sublabel: 'text-lg',
    emoji: 'text-2xl',
  },
};

const colorThemes = {
  jungle: {
    checked: 'bg-jungle border-jungle text-white',
    unchecked: 'border-jungle/30 hover:border-jungle/50',
    card: 'border-jungle/30 bg-jungle/5 hover:bg-jungle/10',
    checkedCard: 'border-jungle bg-jungle/20',
  },
  ocean: {
    checked: 'bg-blue-500 border-blue-500 text-white',
    unchecked: 'border-blue-300 hover:border-blue-400',
    card: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
    checkedCard: 'border-blue-500 bg-blue-100',
  },
  space: {
    checked: 'bg-purple-500 border-purple-500 text-white',
    unchecked: 'border-purple-300 hover:border-purple-400',
    card: 'border-purple-200 bg-purple-50 hover:bg-purple-100',
    checkedCard: 'border-purple-500 bg-purple-100',
  },
  rainbow: {
    checked: 'bg-gradient-to-r from-pink-500 to-purple-500 border-pink-500 text-white',
    unchecked: 'border-pink-300 hover:border-pink-400',
    card: 'border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100',
    checkedCard: 'border-pink-500 bg-gradient-to-r from-pink-100 to-purple-100',
  },
  custom: {
    checked: 'bg-gray-800 border-gray-800 text-white',
    unchecked: 'border-gray-300 hover:border-gray-400',
    card: 'border-gray-200 bg-gray-50 hover:bg-gray-100',
    checkedCard: 'border-gray-800 bg-gray-100',
  },
};

const difficultyBadges = {
  easy: { emoji: '🌟', color: 'bg-green-100 text-green-700', label: 'Easy' },
  medium: { emoji: '⚡', color: 'bg-yellow-100 text-yellow-700', label: 'Medium' },
  hard: { emoji: '🏆', color: 'bg-red-100 text-red-700', label: 'Hard' },
};

const celebrationEmojis = ['🎉', '✨', '🌟', '⭐', '💫', '🎊', '🦄', '🌈'];

export const EnhancedCheckbox: React.FC<EnhancedCheckboxProps> = ({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  disabled = false,
  indeterminate = false,
  
  // Content
  label,
  sublabel,
  image,
  emoji,
  icon: Icon,
  
  // Enhanced features
  variant = 'default',
  size = 'md',
  color = 'jungle',
  
  // Educational features
  pronounceLabel = false,
  showPoints = false,
  points = 10,
  difficulty,
  category,
  
  // Child-friendly features
  celebrationAnimation = true,
  successSound = false,
  funMode = false,
  emojiReaction = false,
  
  // Gamification
  unlockable = false,
  locked = false,
  requirement,
  badge,
  
  // Form field props
  id,
  description,
  error,
  success,
  hint,
  className,
  theme = 'jungle',
  
  // Accessibility
  ariaLabel,
  ariaDescribedBy,
  ...formFieldProps
}) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(successSound);
  
  const checked = controlledChecked !== undefined ? controlledChecked : internalChecked;
  const styles = sizeStyles[size];
  const colors = colorThemes[color];

  // Handle celebration animation
  useEffect(() => {
    if (checked && celebrationAnimation && !isAnimating) {
      setIsAnimating(true);
      setShowCelebration(true);
      
      if (showPoints && points > 0) {
        setEarnedPoints(prev => prev + points);
      }
      
      setTimeout(() => {
        setShowCelebration(false);
        setIsAnimating(false);
      }, 2000);
    }
  }, [checked, celebrationAnimation, showPoints, points, isAnimating]);

  // Handle checkbox change
  const handleChange = (newChecked: boolean) => {
    if (disabled || locked) return;
    
    if (controlledChecked === undefined) {
      setInternalChecked(newChecked);
    }
    
    onChange?.(newChecked);

    // Play success sound
    if (newChecked && isSoundEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Great choice!');
      utterance.volume = 0.3;
      utterance.rate = 1.2;
      speechSynthesis.speak(utterance);
    }

    // Pronounce label
    if (newChecked && pronounceLabel && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Selected ${label}`);
      utterance.volume = 0.5;
      speechSynthesis.speak(utterance);
    }
  };

  // Render checkbox variants
  const renderCheckbox = () => {
    switch (variant) {
      case 'card':
        return (
          <motion.div
            className={cn(
              'relative border-2 rounded-lg cursor-pointer transition-all duration-200',
              styles.container,
              checked ? colors.checkedCard : colors.card,
              disabled && 'opacity-50 cursor-not-allowed',
              locked && 'opacity-60 cursor-not-allowed',
              className
            )}
            onClick={() => !disabled && !locked && handleChange(!checked)}
            whileHover={funMode && !disabled && !locked ? { scale: 1.02 } : {}}
            whileTap={funMode && !disabled && !locked ? { scale: 0.98 } : {}}
            role="checkbox"
            aria-checked={checked}
            aria-label={ariaLabel || label}
            aria-describedby={ariaDescribedBy}
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                handleChange(!checked);
              }
            }}
          >
            {/* Lock overlay */}
            {locked && (
              <div className="absolute inset-0 bg-gray-900/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Crown className="w-6 h-6 mx-auto mb-1 text-gray-500" />
                  {requirement && (
                    <p className="text-xs text-gray-600">{requirement}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              {/* Visual content */}
              <div className="flex-shrink-0">
                {image ? (
                  <img 
                    src={image} 
                    alt={label}
                    className={cn('rounded object-cover', 
                      size === 'sm' && 'w-8 h-8',
                      size === 'md' && 'w-12 h-12',
                      size === 'lg' && 'w-16 h-16',
                      size === 'xl' && 'w-20 h-20'
                    )}
                  />
                ) : emoji ? (
                  <span className={styles.emoji} role="img" aria-hidden="true">
                    {emoji}
                  </span>
                ) : Icon ? (
                  <Icon className={cn(
                    size === 'sm' && 'w-6 h-6',
                    size === 'md' && 'w-8 h-8',
                    size === 'lg' && 'w-10 h-10',
                    size === 'xl' && 'w-12 h-12'
                  )} />
                ) : null}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={cn('font-medium truncate', styles.label)}>
                    {label}
                  </h3>
                  
                  {/* Difficulty badge */}
                  {difficulty && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs px-1.5 py-0.5',
                        difficultyBadges[difficulty].color
                      )}
                    >
                      <span className="mr-1">{difficultyBadges[difficulty].emoji}</span>
                      {difficultyBadges[difficulty].label}
                    </Badge>
                  )}
                  
                  {/* Badge */}
                  {badge && (
                    <Badge variant="secondary" className="text-xs">
                      {badge}
                    </Badge>
                  )}
                </div>
                
                {sublabel && (
                  <p className={cn('text-gray-600 truncate mt-1', styles.sublabel)}>
                    {sublabel}
                  </p>
                )}
                
                {category && (
                  <p className="text-xs text-gray-500 mt-1">
                    Category: {category}
                  </p>
                )}
              </div>

              {/* Checkbox indicator */}
              <div className="flex-shrink-0 relative">
                <motion.div
                  className={cn(
                    'border-2 rounded flex items-center justify-center transition-all duration-200',
                    styles.checkbox,
                    checked ? colors.checked : colors.unchecked
                  )}
                  animate={{
                    scale: checked ? [1, 1.2, 1] : 1,
                    rotate: checked && funMode ? [0, 10, -10, 0] : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <AnimatePresence>
                    {checked && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      >
                        <CheckCircle className="w-full h-full" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Points display */}
                {showPoints && checked && (
                  <motion.div
                    className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center border-2 border-white"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                  >
                    +{points}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Celebration overlay */}
            <AnimatePresence>
              {showCelebration && (
                <motion.div
                  className="absolute inset-0 pointer-events-none flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {celebrationEmojis.map((emoji, index) => (
                    <motion.span
                      key={index}
                      className="absolute text-2xl"
                      initial={{
                        scale: 0,
                        x: 0,
                        y: 0,
                        opacity: 0,
                      }}
                      animate={{
                        scale: [0, 1.5, 1],
                        x: (Math.random() - 0.5) * 100,
                        y: (Math.random() - 0.5) * 100,
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        delay: index * 0.1,
                        ease: 'easeOut',
                      }}
                    >
                      {emoji}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );

      case 'button':
        return (
          <motion.button
            type="button"
            onClick={() => handleChange(!checked)}
            disabled={disabled || locked}
            className={cn(
              'relative flex items-center gap-3 w-full text-left border-2 rounded-lg transition-all duration-200',
              styles.container,
              checked ? colors.checkedCard : colors.card,
              disabled && 'opacity-50 cursor-not-allowed',
              locked && 'opacity-60 cursor-not-allowed',
              'focus:outline-none focus:ring-2 focus:ring-jungle/50',
              className
            )}
            whileHover={funMode && !disabled && !locked ? { scale: 1.02 } : {}}
            whileTap={funMode && !disabled && !locked ? { scale: 0.98 } : {}}
            aria-label={ariaLabel || label}
            aria-pressed={checked}
          >
            {/* Content similar to card variant but optimized for button */}
            <div className="flex items-center gap-3 w-full">
              {(emoji || Icon) && (
                <div className="flex-shrink-0">
                  {emoji ? (
                    <span className={styles.emoji}>{emoji}</span>
                  ) : Icon ? (
                    <Icon className={styles.checkbox} />
                  ) : null}
                </div>
              )}
              
              <div className="flex-1">
                <span className={styles.label}>{label}</span>
                {sublabel && (
                  <p className={cn('text-gray-600 mt-1', styles.sublabel)}>
                    {sublabel}
                  </p>
                )}
              </div>
              
              <div className={cn(
                'border-2 rounded flex items-center justify-center flex-shrink-0',
                styles.checkbox,
                checked ? colors.checked : colors.unchecked
              )}>
                {checked && <CheckCircle className="w-full h-full" />}
              </div>
            </div>
          </motion.button>
        );

      default:
        return (
          <div className={cn('flex items-center gap-3', className)}>
            <Checkbox
              id={id}
              checked={checked}
              onCheckedChange={handleChange}
              disabled={disabled || locked}
              className={cn(
                styles.checkbox,
                checked ? colors.checked : colors.unchecked
              )}
              aria-label={ariaLabel}
              aria-describedby={ariaDescribedBy}
            />
            
            <label
              htmlFor={id}
              className={cn(
                'flex items-center gap-2 cursor-pointer',
                styles.label,
                disabled && 'opacity-50 cursor-not-allowed',
                locked && 'opacity-60 cursor-not-allowed'
              )}
            >
              {emoji && <span className={styles.emoji}>{emoji}</span>}
              {Icon && <Icon className="w-5 h-5" />}
              <div>
                <span>{label}</span>
                {sublabel && (
                  <p className={cn('text-gray-600 mt-0.5', styles.sublabel)}>
                    {sublabel}
                  </p>
                )}
              </div>
              
              {difficulty && (
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs px-1.5 py-0.5 ml-2',
                    difficultyBadges[difficulty].color
                  )}
                >
                  {difficultyBadges[difficulty].label}
                </Badge>
              )}
            </label>

            {/* Sound toggle */}
            {successSound && (
              <button
                type="button"
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors ml-auto"
                aria-label={`${isSoundEnabled ? 'Disable' : 'Enable'} success sounds`}
              >
                {isSoundEnabled ? (
                  <Volume2 className="w-4 h-4 text-jungle" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
              </button>
            )}
          </div>
        );
    }
  };

  // For card and button variants, wrap in FormField
  if (variant === 'card' || variant === 'button') {
    return (
      <FormField
        id={id}
        description={description}
        error={error}
        success={success}
        hint={hint}
        theme={theme}
        {...formFieldProps}
      >
        {renderCheckbox()}
      </FormField>
    );
  }

  // For default variant, render without FormField wrapper
  return renderCheckbox();
};

export default EnhancedCheckbox;
