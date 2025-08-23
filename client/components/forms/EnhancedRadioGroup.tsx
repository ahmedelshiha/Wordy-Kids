// Enhanced RadioGroup Component for Educational Applications
// Extends base RadioGroup with animations, educational features, and child-friendly interactions

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FormField, FormFieldProps } from "./FormField";
import { Badge } from "@/components/ui/badge";
import {
  Circle,
  CheckCircle,
  Star,
  Heart,
  Crown,
  Award,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  Info,
} from "lucide-react";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  emoji?: string;
  icon?: React.ComponentType<{ className?: string }>;
  image?: string;
  disabled?: boolean;
  recommended?: boolean;
  difficulty?: "easy" | "medium" | "hard";
  points?: number;
  category?: string;
  tooltip?: string;
}

export interface EnhancedRadioGroupProps
  extends Omit<FormFieldProps, "children"> {
  // Basic radio group props
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;

  // Layout and appearance
  orientation?: "vertical" | "horizontal" | "grid";
  variant?: "default" | "cards" | "buttons" | "images";
  size?: "sm" | "md" | "lg" | "xl";
  columns?: number; // for grid layout

  // Educational features
  pronounceOptions?: boolean;
  showExplanations?: boolean;
  progressFeedback?: boolean;
  pointsSystem?: boolean;

  // Child-friendly features
  funAnimations?: boolean;
  successSounds?: boolean;
  emojiMode?: boolean;
  celebrationOnSelect?: boolean;

  // Color themes
  colorTheme?: "jungle" | "ocean" | "space" | "rainbow";

  // Gamification
  showProgress?: boolean;
  unlockSequentially?: boolean;

  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const sizeStyles = {
  sm: {
    container: "p-2",
    radio: "w-4 h-4",
    label: "text-sm",
    description: "text-xs",
    emoji: "text-base",
    spacing: "gap-2",
  },
  md: {
    container: "p-3",
    radio: "w-5 h-5",
    label: "text-base",
    description: "text-sm",
    emoji: "text-lg",
    spacing: "gap-3",
  },
  lg: {
    container: "p-4",
    radio: "w-6 h-6",
    label: "text-lg",
    description: "text-base",
    emoji: "text-xl",
    spacing: "gap-4",
  },
  xl: {
    container: "p-6",
    radio: "w-8 h-8",
    label: "text-xl",
    description: "text-lg",
    emoji: "text-2xl",
    spacing: "gap-6",
  },
};

const colorThemes = {
  jungle: {
    selected: "border-jungle bg-jungle/10 text-jungle-dark",
    unselected: "border-jungle/20 hover:border-jungle/40 hover:bg-jungle/5",
    radio:
      "border-jungle data-[state=checked]:bg-jungle data-[state=checked]:border-jungle",
    accent: "text-jungle",
  },
  ocean: {
    selected: "border-blue-500 bg-blue-50 text-blue-900",
    unselected: "border-blue-200 hover:border-blue-300 hover:bg-blue-50",
    radio:
      "border-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500",
    accent: "text-blue-600",
  },
  space: {
    selected: "border-purple-500 bg-purple-50 text-purple-900",
    unselected: "border-purple-200 hover:border-purple-300 hover:bg-purple-50",
    radio:
      "border-purple-500 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500",
    accent: "text-purple-600",
  },
  rainbow: {
    selected:
      "border-pink-500 bg-gradient-to-r from-pink-50 to-purple-50 text-pink-900",
    unselected: "border-pink-200 hover:border-pink-300 hover:bg-pink-50",
    radio:
      "border-pink-500 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500",
    accent: "text-pink-600",
  },
};

const difficultyIndicators = {
  easy: {
    emoji: "🌟",
    color: "bg-green-100 text-green-700 border-green-300",
    points: 5,
  },
  medium: {
    emoji: "⚡",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    points: 10,
  },
  hard: {
    emoji: "🏆",
    color: "bg-red-100 text-red-700 border-red-300",
    points: 15,
  },
};

export const EnhancedRadioGroup: React.FC<EnhancedRadioGroupProps> = ({
  options,
  value: controlledValue,
  defaultValue = "",
  onChange,
  disabled = false,

  // Layout and appearance
  orientation = "vertical",
  variant = "default",
  size = "md",
  columns = 2,

  // Educational features
  pronounceOptions = false,
  showExplanations = false,
  progressFeedback = false,
  pointsSystem = false,

  // Child-friendly features
  funAnimations = true,
  successSounds = false,
  emojiMode = false,
  celebrationOnSelect = false,

  // Color themes
  colorTheme = "jungle",

  // Gamification
  showProgress = false,
  unlockSequentially = false,

  // Form field props
  id,
  label,
  description,
  error,
  success,
  hint,
  required = false,
  className,
  theme = "jungle",
  difficulty,
  encouragementLevel = "moderate",

  // Accessibility
  ariaLabel,
  ariaDescribedBy,
  ...formFieldProps
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [selectedOption, setSelectedOption] = useState<RadioOption | null>(
    null,
  );
  const [totalPoints, setTotalPoints] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(successSounds);
  const [isAnimating, setIsAnimating] = useState(false);

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const styles = sizeStyles[size];
  const colors = colorThemes[colorTheme];

  // Update selected option when value changes
  useEffect(() => {
    const option = options.find((opt) => opt.value === value);
    setSelectedOption(option || null);
  }, [value, options]);

  // Handle value change
  const handleValueChange = (newValue: string) => {
    const option = options.find((opt) => opt.value === newValue);

    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }

    onChange?.(newValue);

    // Add points if enabled
    if (pointsSystem && option?.points) {
      setTotalPoints((prev) => prev + option.points!);
    }

    // Play success sound
    if (isSoundEnabled && option && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance("Good choice!");
      utterance.volume = 0.3;
      utterance.rate = 1.2;
      speechSynthesis.speak(utterance);
    }

    // Pronounce selected option
    if (pronounceOptions && option && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Selected ${option.label}`,
      );
      utterance.volume = 0.5;
      speechSynthesis.speak(utterance);
    }

    // Celebration animation
    if (celebrationOnSelect && option) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  // Get layout classes
  const getLayoutClasses = () => {
    switch (orientation) {
      case "horizontal":
        return `flex flex-wrap ${styles.spacing}`;
      case "grid":
        return `grid grid-cols-1 md:grid-cols-${columns} ${styles.spacing}`;
      default:
        return `space-y-3`;
    }
  };

  // Check if option should be disabled
  const isOptionDisabled = (option: RadioOption, index: number) => {
    if (disabled || option.disabled) return true;
    if (unlockSequentially && index > 0) {
      // Check if previous option was selected
      const previousOption = options[index - 1];
      return value !== previousOption?.value;
    }
    return false;
  };

  // Render option based on variant
  const renderOption = (option: RadioOption, index: number) => {
    const isSelected = value === option.value;
    const isDisabled = isOptionDisabled(option, index);
    const optionId = `${id}-option-${index}`;

    switch (variant) {
      case "cards":
        return (
          <motion.div
            key={option.value}
            className={cn(
              "relative border-2 rounded-lg cursor-pointer transition-all duration-200",
              styles.container,
              isSelected ? colors.selected : colors.unselected,
              isDisabled && "opacity-50 cursor-not-allowed",
              "focus-within:ring-2 focus-within:ring-jungle/50",
            )}
            whileHover={funAnimations && !isDisabled ? { scale: 1.02 } : {}}
            whileTap={funAnimations && !isDisabled ? { scale: 0.98 } : {}}
            animate={
              isAnimating && isSelected
                ? {
                    scale: [1, 1.05, 1],
                    rotate: [0, 1, -1, 0],
                  }
                : {}
            }
            transition={{ duration: 0.3 }}
          >
            <Label htmlFor={optionId} className="cursor-pointer block">
              <div className="flex items-start gap-3">
                {/* Visual content */}
                <div className="flex-shrink-0 mt-1">
                  {option.image ? (
                    <img
                      src={option.image}
                      alt={option.label}
                      className={cn(
                        "rounded object-cover",
                        size === "sm" && "w-8 h-8",
                        size === "md" && "w-12 h-12",
                        size === "lg" && "w-16 h-16",
                        size === "xl" && "w-20 h-20",
                      )}
                    />
                  ) : option.emoji ? (
                    <span
                      className={styles.emoji}
                      role="img"
                      aria-hidden="true"
                    >
                      {option.emoji}
                    </span>
                  ) : option.icon ? (
                    <option.icon
                      className={cn(
                        size === "sm" && "w-6 h-6",
                        size === "md" && "w-8 h-8",
                        size === "lg" && "w-10 h-10",
                        size === "xl" && "w-12 h-12",
                      )}
                    />
                  ) : null}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("font-medium", styles.label)}>
                      {option.label}
                    </span>

                    {/* Recommended badge */}
                    {option.recommended && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-yellow-100 text-yellow-700"
                      >
                        ⭐ Recommended
                      </Badge>
                    )}

                    {/* Difficulty badge */}
                    {option.difficulty && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs px-1.5 py-0.5",
                          difficultyIndicators[option.difficulty].color,
                        )}
                      >
                        <span className="mr-1">
                          {difficultyIndicators[option.difficulty].emoji}
                        </span>
                        {option.difficulty}
                      </Badge>
                    )}

                    {/* Points display */}
                    {pointsSystem && option.points && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-50 text-green-700"
                      >
                        +{option.points} pts
                      </Badge>
                    )}
                  </div>

                  {option.description && (
                    <p
                      className={cn(
                        "text-gray-600 leading-relaxed",
                        styles.description,
                      )}
                    >
                      {option.description}
                    </p>
                  )}

                  {option.category && (
                    <p className="text-xs text-gray-500 mt-1">
                      Category: {option.category}
                    </p>
                  )}
                </div>

                {/* Radio button */}
                <div className="flex-shrink-0 mt-1">
                  <RadioGroupItem
                    value={option.value}
                    id={optionId}
                    disabled={isDisabled}
                    className={cn(styles.radio, colors.radio)}
                    aria-describedby={
                      option.description ? `${optionId}-desc` : undefined
                    }
                  />
                </div>
              </div>
            </Label>

            {/* Unlock indicator */}
            {unlockSequentially && index > 0 && isDisabled && (
              <div className="absolute inset-0 bg-gray-900/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Crown className="w-6 h-6 mx-auto mb-1 text-gray-500" />
                  <p className="text-xs text-gray-600">
                    Complete previous first
                  </p>
                </div>
              </div>
            )}

            {/* Selection celebration */}
            <AnimatePresence>
              {isSelected && isAnimating && celebrationOnSelect && (
                <motion.div
                  className="absolute inset-0 pointer-events-none flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="text-2xl"
                    animate={{
                      scale: [0, 1.5, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{ duration: 0.8 }}
                  >
                    ✨
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );

      case "buttons":
        return (
          <motion.div
            key={option.value}
            whileHover={funAnimations && !isDisabled ? { scale: 1.02 } : {}}
            whileTap={funAnimations && !isDisabled ? { scale: 0.98 } : {}}
          >
            <Label htmlFor={optionId}>
              <div
                className={cn(
                  "flex items-center justify-center text-center border-2 rounded-lg cursor-pointer transition-all duration-200",
                  styles.container,
                  isSelected ? colors.selected : colors.unselected,
                  isDisabled && "opacity-50 cursor-not-allowed",
                )}
              >
                <div>
                  {option.emoji && (
                    <div className={cn("mb-2", styles.emoji)}>
                      {option.emoji}
                    </div>
                  )}
                  <div className={styles.label}>{option.label}</div>
                  {option.description && (
                    <div
                      className={cn("mt-1 text-gray-600", styles.description)}
                    >
                      {option.description}
                    </div>
                  )}
                </div>
                <RadioGroupItem
                  value={option.value}
                  id={optionId}
                  disabled={isDisabled}
                  className="sr-only"
                />
              </div>
            </Label>
          </motion.div>
        );

      default:
        return (
          <motion.div
            key={option.value}
            className="flex items-center space-x-3"
            whileHover={funAnimations && !isDisabled ? { x: 2 } : {}}
          >
            <RadioGroupItem
              value={option.value}
              id={optionId}
              disabled={isDisabled}
              className={cn(styles.radio, colors.radio)}
            />
            <Label
              htmlFor={optionId}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                styles.label,
              )}
            >
              {option.emoji && (
                <span className={styles.emoji}>{option.emoji}</span>
              )}
              {option.icon && <option.icon className="w-5 h-5" />}
              <div>
                <span>{option.label}</span>
                {option.description && (
                  <p className={cn("text-gray-600 mt-0.5", styles.description)}>
                    {option.description}
                  </p>
                )}
              </div>

              {/* Badges for default variant */}
              <div className="flex items-center gap-1 ml-2">
                {option.recommended && (
                  <Badge variant="secondary" className="text-xs">
                    Recommended
                  </Badge>
                )}
                {option.difficulty && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      difficultyIndicators[option.difficulty].color,
                    )}
                  >
                    {option.difficulty}
                  </Badge>
                )}
                {pointsSystem && option.points && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-green-50 text-green-700"
                  >
                    +{option.points}
                  </Badge>
                )}
              </div>
            </Label>
          </motion.div>
        );
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
      <div className="space-y-4">
        {/* Progress and points display */}
        {(showProgress || pointsSystem) && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            {showProgress && (
              <div className="flex items-center gap-2">
                <Circle className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Progress: {value ? "1" : "0"} of {options.length}
                </span>
              </div>
            )}

            {pointsSystem && totalPoints > 0 && (
              <motion.div
                className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Sparkles className="w-4 h-4" />
                <span className="font-bold">{totalPoints} points</span>
              </motion.div>
            )}

            {successSounds && (
              <button
                type="button"
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={`${isSoundEnabled ? "Disable" : "Enable"} success sounds`}
              >
                {isSoundEnabled ? (
                  <Volume2 className="w-4 h-4 text-jungle" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
              </button>
            )}
          </div>
        )}

        {/* Radio Group */}
        <RadioGroup
          value={value}
          onValueChange={handleValueChange}
          disabled={disabled}
          className={getLayoutClasses()}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
        >
          {options.map((option, index) => renderOption(option, index))}
        </RadioGroup>

        {/* Selected option explanation */}
        {showExplanations && selectedOption?.description && (
          <motion.div
            className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  About your choice:
                </h4>
                <p className="text-sm text-blue-700">
                  {selectedOption.description}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress feedback */}
        {progressFeedback && value && (
          <motion.div
            className="p-3 bg-green-50 border border-green-200 rounded-lg text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-sm text-green-700 font-medium">
              Great choice! You've made your selection.
            </p>
          </motion.div>
        )}
      </div>
    </FormField>
  );
};

export default EnhancedRadioGroup;
