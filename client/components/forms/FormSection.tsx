// FormSection Component for organizing form content into logical groups
// Provides visual separation and accessibility structure

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Info, Star, Crown, Zap } from 'lucide-react';

export interface FormSectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  emoji?: string;
  
  // Layout variants
  variant?: 'default' | 'card' | 'subtle' | 'highlighted';
  spacing?: 'compact' | 'normal' | 'relaxed';
  
  // Educational features
  difficulty?: 'easy' | 'medium' | 'hard';
  importance?: 'low' | 'medium' | 'high' | 'critical';
  helpText?: string;
  
  // Visual enhancements
  theme?: 'jungle' | 'ocean' | 'space' | 'rainbow';
  showProgress?: boolean;
  currentStep?: number;
  totalSteps?: number;
  
  // State
  isComplete?: boolean;
  hasErrors?: boolean;
  isRequired?: boolean;
  
  // Animation
  animateEntry?: boolean;
  delay?: number;
  
  className?: string;
  id?: string;
}

const themeStyles = {
  jungle: {
    border: 'border-jungle/20',
    background: 'bg-jungle/5',
    accent: 'text-jungle-dark',
    highlight: 'bg-jungle/10 border-jungle/30',
  },
  ocean: {
    border: 'border-blue-200',
    background: 'bg-blue-50/50',
    accent: 'text-blue-800',
    highlight: 'bg-blue-100 border-blue-300',
  },
  space: {
    border: 'border-purple-200',
    background: 'bg-purple-50/50',
    accent: 'text-purple-800',
    highlight: 'bg-purple-100 border-purple-300',
  },
  rainbow: {
    border: 'border-pink-200',
    background: 'bg-gradient-to-r from-pink-50/50 to-purple-50/50',
    accent: 'text-pink-800',
    highlight: 'bg-gradient-to-r from-pink-100 to-purple-100 border-pink-300',
  },
};

const spacingStyles = {
  compact: 'space-y-3',
  normal: 'space-y-4',
  relaxed: 'space-y-6',
};

const difficultyIndicators = {
  easy: { emoji: '🌟', color: 'bg-green-100 text-green-700', label: 'Easy' },
  medium: { emoji: '⚡', color: 'bg-yellow-100 text-yellow-700', label: 'Medium' },
  hard: { emoji: '🏆', color: 'bg-red-100 text-red-700', label: 'Challenge' },
};

const importanceIndicators = {
  low: { icon: Info, color: 'text-gray-500', label: 'Optional' },
  medium: { icon: Star, color: 'text-blue-500', label: 'Important' },
  high: { icon: Zap, color: 'text-orange-500', label: 'Very Important' },
  critical: { icon: Crown, color: 'text-red-500', label: 'Required' },
};

const FormSection: React.FC<FormSectionProps> = ({
  children,
  title,
  description,
  icon: Icon,
  emoji,
  
  // Layout variants
  variant = 'default',
  spacing = 'normal',
  
  // Educational features
  difficulty,
  importance = 'medium',
  helpText,
  
  // Visual enhancements
  theme = 'jungle',
  showProgress = false,
  currentStep,
  totalSteps,
  
  // State
  isComplete = false,
  hasErrors = false,
  isRequired = false,
  
  // Animation
  animateEntry = true,
  delay = 0,
  
  className,
  id,
}) => {
  const styles = themeStyles[theme];
  const ImportanceIcon = importanceIndicators[importance].icon;

  // Calculate progress percentage
  const progressPercentage = showProgress && currentStep && totalSteps 
    ? Math.round((currentStep / totalSteps) * 100)
    : 0;

  const renderContent = () => (
    <div className={cn(spacingStyles[spacing], 'w-full')}>
      {children}
    </div>
  );

  const renderHeader = () => {
    if (!title && !description && !showProgress) return null;

    return (
      <div className="space-y-3">
        {/* Title and metadata */}
        {title && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Icon or emoji */}
              {emoji ? (
                <span className="text-2xl" role="img" aria-hidden="true">
                  {emoji}
                </span>
              ) : Icon ? (
                <Icon className="w-6 h-6 text-jungle" />
              ) : null}
              
              {/* Title */}
              <h3 className={cn(
                'text-lg font-semibold',
                styles.accent,
                hasErrors && 'text-red-700',
                isComplete && 'text-green-700'
              )}>
                {title}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </h3>
            </div>

            {/* Status badges */}
            <div className="flex items-center gap-2">
              {/* Difficulty badge */}
              {difficulty && (
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs px-2 py-1',
                    difficultyIndicators[difficulty].color
                  )}
                >
                  <span className="mr-1">{difficultyIndicators[difficulty].emoji}</span>
                  {difficultyIndicators[difficulty].label}
                </Badge>
              )}

              {/* Importance badge */}
              <Badge
                variant="outline"
                className={cn(
                  'text-xs px-2 py-1 flex items-center gap-1',
                  importance === 'critical' && 'bg-red-50 text-red-700 border-red-300',
                  importance === 'high' && 'bg-orange-50 text-orange-700 border-orange-300',
                  importance === 'medium' && 'bg-blue-50 text-blue-700 border-blue-300',
                  importance === 'low' && 'bg-gray-50 text-gray-700 border-gray-300'
                )}
              >
                <ImportanceIcon className="w-3 h-3" />
                {importanceIndicators[importance].label}
              </Badge>

              {/* Completion status */}
              {isComplete && (
                <Badge className="bg-green-100 text-green-700 border-green-300">
                  ✅ Complete
                </Badge>
              )}

              {hasErrors && (
                <Badge className="bg-red-100 text-red-700 border-red-300">
                  ⚠️ Needs attention
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-gray-600 text-sm leading-relaxed">
            {description}
          </p>
        )}

        {/* Progress indicator */}
        {showProgress && currentStep && totalSteps && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="font-medium text-jungle">
                {progressPercentage}% complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-jungle h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Help text */}
        {helpText && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">{helpText}</p>
            </div>
          </div>
        )}

        {/* Separator */}
        <Separator className="my-4" />
      </div>
    );
  };

  // Render based on variant
  switch (variant) {
    case 'card':
      const motionProps = animateEntry ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3, delay },
      } : {};

      return (
        <motion.div
          className={className}
          id={id}
          {...motionProps}
        >
          <Card className={cn(
            'border-2',
            styles.border,
            styles.background,
            hasErrors && 'border-red-300 bg-red-50/30',
            isComplete && 'border-green-300 bg-green-50/30'
          )}>
            {(title || description || showProgress) && (
              <CardHeader className="pb-4">
                {renderHeader()}
              </CardHeader>
            )}
            <CardContent className="pt-0">
              {renderContent()}
            </CardContent>
          </Card>
        </motion.div>
      );

    case 'highlighted':
      return (
        <motion.section
          className={cn(
            'border-2 rounded-lg p-6',
            styles.highlight,
            hasErrors && 'border-red-300 bg-red-50',
            isComplete && 'border-green-300 bg-green-50',
            className
          )}
          id={id}
          initial={animateEntry ? { opacity: 0, scale: 0.95 } : false}
          animate={animateEntry ? { opacity: 1, scale: 1 } : false}
          transition={{ duration: 0.3, delay }}
          role="group"
          aria-labelledby={title ? `${id}-title` : undefined}
        >
          {renderHeader()}
          {renderContent()}
        </motion.section>
      );

    case 'subtle':
      return (
        <motion.section
          className={cn(
            'border-l-4 pl-4 py-2',
            importance === 'critical' && 'border-red-500',
            importance === 'high' && 'border-orange-500',
            importance === 'medium' && 'border-jungle',
            importance === 'low' && 'border-gray-400',
            className
          )}
          id={id}
          initial={animateEntry ? { opacity: 0, x: -20 } : false}
          animate={animateEntry ? { opacity: 1, x: 0 } : false}
          transition={{ duration: 0.3, delay }}
          role="group"
          aria-labelledby={title ? `${id}-title` : undefined}
        >
          {renderHeader()}
          {renderContent()}
        </motion.section>
      );

    default:
      return (
        <motion.section
          className={cn(
            'space-y-4',
            className
          )}
          id={id}
          initial={animateEntry ? { opacity: 0, y: 10 } : false}
          animate={animateEntry ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.3, delay }}
          role="group"
          aria-labelledby={title ? `${id}-title` : undefined}
        >
          {renderHeader()}
          {renderContent()}
        </motion.section>
      );
  }
};

export default FormSection;
