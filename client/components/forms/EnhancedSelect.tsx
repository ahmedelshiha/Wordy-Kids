// Enhanced Select Component for Educational Applications
// Extends base Select with search, multi-select, and child-friendly features

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField, FormFieldProps } from './FormField';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  X,
  Check,
  ChevronDown,
  Sparkles,
  Star,
  Heart,
  Zap,
  Crown,
  Wand2,
} from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  emoji?: string;
  category?: string;
  disabled?: boolean;
  popular?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  icon?: React.ComponentType<{ className?: string }>;
}

export interface EnhancedSelectProps extends Omit<FormFieldProps, 'children'> {
  // Basic select props
  options: SelectOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  
  // Enhanced features
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  maxSelections?: number;
  groupByCategory?: boolean;
  showPopularFirst?: boolean;
  
  // Educational features
  pronounceOptions?: boolean;
  showDifficulty?: boolean;
  enableFavorites?: boolean;
  gamification?: boolean;
  
  // Child-friendly features
  funAnimations?: boolean;
  emojiMode?: boolean;
  colorfulOptions?: boolean;
  encouragementMessages?: boolean;
  
  // Filtering and search
  filterFunction?: (option: SelectOption, searchTerm: string) => boolean;
  noResultsMessage?: string;
  loadingMessage?: string;
  
  // Accessibility
  ariaLabel?: string;
  maxHeight?: string;
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-700 border-green-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  hard: 'bg-red-100 text-red-700 border-red-300',
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  animals: ({ className }) => <span className={className}>🦁</span>,
  colors: ({ className }) => <span className={className}>🌈</span>,
  shapes: ({ className }) => <span className={className}>⭐</span>,
  numbers: ({ className }) => <span className={className}>🔢</span>,
  letters: ({ className }) => <span className={className}>📝</span>,
  science: ({ className }) => <span className={className}>🔬</span>,
  default: Star,
};

export const EnhancedSelect: React.FC<EnhancedSelectProps> = ({
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = 'Choose an option...',
  disabled = false,
  
  // Enhanced features
  multiple = false,
  searchable = false,
  clearable = false,
  maxSelections,
  groupByCategory = false,
  showPopularFirst = false,
  
  // Educational features
  pronounceOptions = false,
  showDifficulty = false,
  enableFavorites = false,
  gamification = false,
  
  // Child-friendly features
  funAnimations = true,
  emojiMode = false,
  colorfulOptions = false,
  encouragementMessages = true,
  
  // Filtering and search
  filterFunction,
  noResultsMessage = '🔍 No matches found! Try a different search.',
  loadingMessage = '⏳ Loading options...',
  
  // Form field props
  id,
  label,
  description,
  error,
  success,
  hint,
  required = false,
  className,
  theme = 'jungle',
  difficulty,
  encouragementLevel = 'moderate',
  
  // Accessibility
  ariaLabel,
  maxHeight = '300px',
  ...formFieldProps
}) => {
  // State management
  const [internalValue, setInternalValue] = useState<string | string[]>(
    multiple ? (defaultValue as string[]) || [] : (defaultValue as string) || ''
  );
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedPoints, setSelectedPoints] = useState(0);
  
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load favorites from localStorage
  useEffect(() => {
    if (enableFavorites) {
      const savedFavorites = localStorage.getItem(`select-favorites-${id}`);
      if (savedFavorites) {
        setFavorites(new Set(JSON.parse(savedFavorites)));
      }
    }
  }, [enableFavorites, id]);

  // Save favorites to localStorage
  useEffect(() => {
    if (enableFavorites) {
      localStorage.setItem(`select-favorites-${id}`, JSON.stringify(Array.from(favorites)));
    }
  }, [favorites, enableFavorites, id]);

  // Filter and sort options
  const filteredOptions = React.useMemo(() => {
    let filtered = options;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(option => {
        if (filterFunction) {
          return filterFunction(option, searchTerm);
        }
        return (
          option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          option.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          option.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Sort by popularity and favorites
    if (showPopularFirst || enableFavorites) {
      filtered.sort((a, b) => {
        if (enableFavorites) {
          const aIsFavorite = favorites.has(a.value);
          const bIsFavorite = favorites.has(b.value);
          if (aIsFavorite && !bIsFavorite) return -1;
          if (!aIsFavorite && bIsFavorite) return 1;
        }
        
        if (showPopularFirst) {
          if (a.popular && !b.popular) return -1;
          if (!a.popular && b.popular) return 1;
        }
        
        return a.label.localeCompare(b.label);
      });
    }

    return filtered;
  }, [options, searchTerm, filterFunction, showPopularFirst, enableFavorites, favorites]);

  // Group options by category
  const groupedOptions = React.useMemo(() => {
    if (!groupByCategory) return { all: filteredOptions };
    
    return filteredOptions.reduce((groups, option) => {
      const category = option.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(option);
      return groups;
    }, {} as Record<string, SelectOption[]>);
  }, [filteredOptions, groupByCategory]);

  // Handle selection
  const handleSelect = (optionValue: string) => {
    const option = options.find(opt => opt.value === optionValue);
    
    if (multiple) {
      const currentArray = Array.isArray(value) ? value : [];
      let newValue: string[];
      
      if (currentArray.includes(optionValue)) {
        newValue = currentArray.filter(v => v !== optionValue);
      } else {
        if (maxSelections && currentArray.length >= maxSelections) {
          return; // Don't add if max reached
        }
        newValue = [...currentArray, optionValue];
      }
      
      setInternalValue(newValue);
      onChange?.(newValue);
      
      // Gamification points
      if (gamification && !currentArray.includes(optionValue)) {
        setSelectedPoints(prev => prev + (option?.difficulty === 'hard' ? 10 : option?.difficulty === 'medium' ? 5 : 3));
      }
    } else {
      setInternalValue(optionValue);
      onChange?.(optionValue);
      setIsOpen(false);
      
      // Gamification points
      if (gamification) {
        setSelectedPoints(prev => prev + (option?.difficulty === 'hard' ? 10 : option?.difficulty === 'medium' ? 5 : 3));
      }
    }

    // Pronounce selection
    if (pronounceOptions && option && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Selected ${option.label}`);
      utterance.volume = 0.5;
      speechSynthesis.speak(utterance);
    }

    // Play selection sound
    if (funAnimations && 'speechSynthesis' in window && encouragementMessages) {
      const encouragements = ['Great choice!', 'Excellent!', 'Perfect!', 'Well done!'];
      const message = encouragements[Math.floor(Math.random() * encouragements.length)];
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.volume = 0.3;
      speechSynthesis.speak(utterance);
    }
  };

  // Handle clear
  const handleClear = () => {
    const newValue = multiple ? [] : '';
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (optionValue: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(optionValue)) {
      newFavorites.delete(optionValue);
    } else {
      newFavorites.add(optionValue);
    }
    setFavorites(newFavorites);
  };

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Get display value
  const getDisplayValue = () => {
    if (multiple) {
      const selectedOptions = options.filter(opt => 
        Array.isArray(value) && value.includes(opt.value)
      );
      return selectedOptions.length > 0 
        ? `${selectedOptions.length} selected`
        : placeholder;
    } else {
      const selectedOption = options.find(opt => opt.value === value);
      return selectedOption 
        ? `${selectedOption.emoji || ''} ${selectedOption.label}`.trim()
        : placeholder;
    }
  };

  return (
    <FormField
      id={id}
      label={label}
      description={description}
      error={error}
      success={success}
      hint={hint}
      required={required}
      className={className}
      theme={theme}
      difficulty={difficulty}
      encouragementLevel={encouragementLevel}
      {...formFieldProps}
    >
      <div className="relative">
        {/* Custom Select Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={cn(
            'w-full flex items-center justify-between px-4 py-3 bg-transparent',
            'border-0 focus:outline-none focus:ring-0 transition-all duration-200',
            'text-left text-base h-auto',
            disabled && 'opacity-50 cursor-not-allowed',
            'hover:bg-white/50'
          )}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Gamification Points */}
            {gamification && selectedPoints > 0 && (
              <motion.div
                className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Sparkles className="w-3 h-3" />
                {selectedPoints}
              </motion.div>
            )}
            
            {/* Display Value */}
            <span className={cn(
              'truncate',
              !value || (Array.isArray(value) && value.length === 0) 
                ? 'text-gray-500' 
                : 'text-gray-900'
            )}>
              {getDisplayValue()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Clear Button */}
            {clearable && value && (Array.isArray(value) ? value.length > 0 : value) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Clear selection"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
            
            {/* Dropdown Arrow */}
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </motion.div>
          </div>
        </button>

        {/* Selected Items (Multiple Mode) */}
        {multiple && Array.isArray(value) && value.length > 0 && (
          <motion.div
            className="mt-2 flex flex-wrap gap-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {value.map((selectedValue) => {
              const option = options.find(opt => opt.value === selectedValue);
              if (!option) return null;
              
              return (
                <motion.div
                  key={selectedValue}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <Badge
                    variant="secondary"
                    className={cn(
                      'flex items-center gap-2 pr-1 bg-jungle/10 text-jungle-dark border-jungle/30',
                      colorfulOptions && option.category && 'bg-gradient-to-r from-jungle/10 to-jungle/20'
                    )}
                  >
                    {option.emoji && <span>{option.emoji}</span>}
                    <span>{option.label}</span>
                    <button
                      type="button"
                      onClick={() => handleSelect(selectedValue)}
                      className="ml-1 p-0.5 hover:bg-red-100 rounded-full transition-colors"
                      aria-label={`Remove ${option.label}`}
                    >
                      <X className="w-3 h-3 text-gray-500 hover:text-red-600" />
                    </button>
                  </Badge>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Dropdown Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className={cn(
                'absolute top-full left-0 right-0 z-50 mt-1',
                'bg-white border border-gray-200 rounded-lg shadow-lg',
                'overflow-hidden'
              )}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Search Input */}
              {searchable && (
                <div className="p-3 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search options..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-200 focus:border-jungle focus:ring-jungle/20"
                    />
                  </div>
                </div>
              )}

              {/* Options List */}
              <div 
                className="overflow-y-auto"
                style={{ maxHeight }}
              >
                {filteredOptions.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {noResultsMessage}
                  </div>
                ) : (
                  Object.entries(groupedOptions).map(([category, categoryOptions]) => (
                    <div key={category}>
                      {/* Category Header */}
                      {groupByCategory && (
                        <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 font-medium text-sm text-gray-700 flex items-center gap-2">
                          {categoryIcons[category] && React.createElement(categoryIcons[category], { className: 'w-4 h-4' })}
                          {category}
                        </div>
                      )}
                      
                      {/* Options */}
                      {categoryOptions.map((option) => {
                        const isSelected = multiple 
                          ? Array.isArray(value) && value.includes(option.value)
                          : value === option.value;
                        const isFavorite = favorites.has(option.value);
                        
                        return (
                          <motion.button
                            key={option.value}
                            type="button"
                            onClick={() => !option.disabled && handleSelect(option.value)}
                            disabled={option.disabled}
                            className={cn(
                              'w-full px-3 py-3 text-left flex items-center justify-between',
                              'hover:bg-gray-50 transition-colors duration-150',
                              'focus:outline-none focus:bg-jungle/10',
                              isSelected && 'bg-jungle/10 text-jungle-dark',
                              option.disabled && 'opacity-50 cursor-not-allowed',
                              colorfulOptions && 'hover:bg-gradient-to-r hover:from-jungle/5 hover:to-jungle/10'
                            )}
                            whileHover={funAnimations ? { scale: 1.02 } : {}}
                            whileTap={funAnimations ? { scale: 0.98 } : {}}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {/* Option Icon/Emoji */}
                              {option.emoji ? (
                                <span className="text-lg flex-shrink-0">{option.emoji}</span>
                              ) : option.icon ? (
                                <option.icon className="w-5 h-5 flex-shrink-0" />
                              ) : null}
                              
                              {/* Option Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium truncate">{option.label}</span>
                                  
                                  {/* Difficulty Badge */}
                                  {showDifficulty && option.difficulty && (
                                    <Badge 
                                      variant="outline"
                                      className={cn(
                                        'text-xs px-1.5 py-0.5',
                                        difficultyColors[option.difficulty]
                                      )}
                                    >
                                      {option.difficulty}
                                    </Badge>
                                  )}
                                  
                                  {/* Popular Badge */}
                                  {option.popular && (
                                    <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-yellow-50 text-yellow-700 border-yellow-300">
                                      ⭐ Popular
                                    </Badge>
                                  )}
                                </div>
                                
                                {/* Option Description */}
                                {option.description && (
                                  <p className="text-sm text-gray-500 truncate mt-0.5">
                                    {option.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* Favorite Button */}
                              {enableFavorites && (
                                <button
                                  type="button"
                                  onClick={(e) => handleFavoriteToggle(option.value, e)}
                                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                  aria-label={`${isFavorite ? 'Remove from' : 'Add to'} favorites`}
                                >
                                  <Heart className={cn(
                                    'w-4 h-4',
                                    isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'
                                  )} />
                                </button>
                              )}
                              
                              {/* Selection Indicator */}
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 400 }}
                                >
                                  <Check className="w-4 h-4 text-jungle" />
                                </motion.div>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay to close dropdown */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>
    </FormField>
  );
};

export default EnhancedSelect;
