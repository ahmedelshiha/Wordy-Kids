// Enhanced Input Component for Educational Applications
// Extends base Input with advanced features, validation, and theming

import React, { forwardRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { FormField, FormFieldProps, useFormField } from "./FormField";
import { FormValidator } from "@/lib/form-validation";
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  User,
  Lock,
  Search,
  Calendar,
  MapPin,
  CreditCard,
  Zap,
  Volume2,
  VolumeX,
} from "lucide-react";

export interface EnhancedInputProps extends Omit<FormFieldProps, "children"> {
  // Base input props
  type?:
    | "text"
    | "email"
    | "password"
    | "tel"
    | "number"
    | "search"
    | "url"
    | "date";
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;

  // Enhanced features
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  showPasswordToggle?: boolean;
  autoFormat?: "phone" | "creditCard" | "none";
  realTimeValidation?: boolean;
  validationDelay?: number; // ms
  successSounds?: boolean;

  // Educational features
  pronounceLabel?: boolean;
  showCharacterCount?: boolean;
  strengthMeter?: boolean; // for passwords
  inputAssistance?: "auto" | "manual" | "off";

  // Child-friendly features
  funMode?: boolean;
  emojiValidation?: boolean;
  colorTheme?: "jungle" | "ocean" | "space" | "rainbow";

  // Accessibility
  ariaLabel?: string;
  ariaInvalid?: boolean;
}

const iconMap = {
  email: Mail,
  tel: Phone,
  password: Lock,
  text: User,
  search: Search,
  date: Calendar,
  url: MapPin,
  number: CreditCard,
};

const colorThemes = {
  jungle: {
    focus: "focus:ring-jungle/50 focus:border-jungle",
    valid: "border-jungle text-jungle",
    invalid: "border-red-500 text-red-700",
  },
  ocean: {
    focus: "focus:ring-blue-500/50 focus:border-blue-500",
    valid: "border-blue-500 text-blue-700",
    invalid: "border-red-500 text-red-700",
  },
  space: {
    focus: "focus:ring-purple-500/50 focus:border-purple-500",
    valid: "border-purple-500 text-purple-700",
    invalid: "border-red-500 text-red-700",
  },
  rainbow: {
    focus: "focus:ring-pink-500/50 focus:border-pink-500",
    valid: "border-green-500 text-green-700",
    invalid: "border-red-500 text-red-700",
  },
};

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  (
    {
      type = "text",
      placeholder,
      value: controlledValue,
      defaultValue = "",
      onChange,
      onBlur,
      onFocus,
      disabled = false,
      readOnly = false,
      autoComplete,
      autoFocus = false,
      maxLength,
      minLength,
      pattern,

      // Enhanced features
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      showPasswordToggle = false,
      autoFormat = "none",
      realTimeValidation = true,
      validationDelay = 500,
      successSounds = false,

      // Educational features
      pronounceLabel = false,
      showCharacterCount = false,
      strengthMeter = false,
      inputAssistance = "auto",

      // Child-friendly features
      funMode = false,
      emojiValidation = false,
      colorTheme = "jungle",

      // Form field props
      label,
      description,
      error: externalError,
      success: externalSuccess,
      hint,
      required = false,
      id,
      className,
      theme = "jungle",
      difficulty,
      encouragementLevel = "moderate",

      // Accessibility
      ariaLabel,
      ariaInvalid,
      ...props
    },
    ref,
  ) => {
    // State management
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [characterCount, setCharacterCount] = useState(0);
    const [isSoundEnabled, setIsSoundEnabled] = useState(successSounds);

    const value =
      controlledValue !== undefined ? controlledValue : internalValue;

    // Form field state management
    const {
      error: validationError,
      success: validationSuccess,
      isValidating,
      isValid,
      validate,
      setValue: setFieldValue,
    } = useFormField(value);

    // Use external error/success if provided, otherwise use validation
    const error = externalError || validationError;
    const success = externalSuccess || validationSuccess;

    // Auto-formatting functions
    const formatValue = (inputValue: string): string => {
      switch (autoFormat) {
        case "phone":
          return FormValidator.validateAndFormatPhone(inputValue).formatted;
        case "creditCard":
          return FormValidator.validateCreditCard(inputValue).formatted;
        default:
          return inputValue;
      }
    };

    // Real-time validation with debouncing
    useEffect(() => {
      if (!realTimeValidation || !value || value.length === 0) return;

      const timeoutId = setTimeout(() => {
        switch (type) {
          case "email":
            validate(() => FormValidator.validateEmail(value));
            break;
          case "tel":
            validate(() => FormValidator.validateAndFormatPhone(value));
            break;
          case "password":
            if (strengthMeter) {
              validate(() => FormValidator.validatePasswordStrength(value));
            }
            break;
          default:
            if (required && value.trim().length === 0) {
              validate(() => ({
                isValid: false,
                message: "🌟 This field is needed for your jungle adventure!",
              }));
            } else if (value.trim().length > 0) {
              validate(() => ({ isValid: true, message: "✅ Perfect!" }));
            }
        }
      }, validationDelay);

      return () => clearTimeout(timeoutId);
    }, [
      value,
      type,
      realTimeValidation,
      validationDelay,
      strengthMeter,
      required,
      validate,
    ]);

    // Character count tracking
    useEffect(() => {
      setCharacterCount(value.length);
    }, [value]);

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;

      // Apply formatting
      if (autoFormat !== "none") {
        newValue = formatValue(newValue);
      }

      // Update internal state
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }

      setFieldValue(newValue);
      onChange?.(newValue);

      // Play success sound if enabled and valid
      if (isSoundEnabled && isValid && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance("Great!");
        utterance.volume = 0.3;
        speechSynthesis.speak(utterance);
      }
    };

    // Handle focus
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);

      // Pronounce label for accessibility
      if (pronounceLabel && label && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(`Enter ${label}`);
        utterance.volume = 0.5;
        speechSynthesis.speak(utterance);
      }
    };

    // Handle blur
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    // Get appropriate icon
    const DefaultIcon = leftIcon || iconMap[type];
    const themes = colorThemes[colorTheme];

    // Password strength indicator
    const renderPasswordStrength = () => {
      if (type !== "password" || !strengthMeter || !value) return null;

      const strength = FormValidator.validatePasswordStrength(value);
      const strengthColors = {
        weak: "bg-red-500",
        medium: "bg-yellow-500",
        strong: "bg-green-500",
      };

      return (
        <motion.div
          className="mt-2 space-y-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={cn(
                  "h-2 flex-1 rounded-full transition-colors duration-300",
                  level <= Object.values(strength.checks).filter(Boolean).length
                    ? strengthColors[strength.strength]
                    : "bg-gray-200",
                )}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span
              className={cn(
                "font-medium",
                strength.strength === "weak" && "text-red-600",
                strength.strength === "medium" && "text-yellow-600",
                strength.strength === "strong" && "text-green-600",
              )}
            >
              {strength.message}
            </span>
          </div>
        </motion.div>
      );
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
        isValid={isValid}
        isValidating={isValidating}
        className={className}
        theme={theme}
        difficulty={difficulty}
        encouragementLevel={encouragementLevel}
        {...props}
      >
        <div className="relative">
          {/* Left Icon */}
          {DefaultIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              <DefaultIcon
                className={cn(
                  "w-4 h-4 transition-colors duration-200",
                  isFocused
                    ? themes.focus.split(" ")[1].replace("focus:", "")
                    : "text-gray-400",
                  error && "text-red-500",
                  success && "text-jungle",
                )}
              />
            </div>
          )}

          {/* Input Field */}
          <Input
            ref={ref}
            type={
              showPasswordToggle && type === "password"
                ? showPassword
                  ? "text"
                  : "password"
                : type
            }
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            readOnly={readOnly}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            maxLength={maxLength}
            minLength={minLength}
            pattern={pattern}
            aria-label={ariaLabel}
            aria-invalid={ariaInvalid || !!error}
            aria-describedby={`${id}-description`}
            className={cn(
              "border-0 bg-transparent focus:ring-0 focus:outline-none transition-all duration-200",
              DefaultIcon && "pl-10",
              (showPasswordToggle ||
                RightIcon ||
                showCharacterCount ||
                isSoundEnabled) &&
                "pr-20",
              !DefaultIcon && !showPasswordToggle && !RightIcon && "px-4",
              "text-base py-3 h-auto",
              funMode && "text-lg font-medium",
              isFocused && themes.focus,
              error && themes.invalid,
              success && themes.valid,
              disabled && "opacity-50 cursor-not-allowed",
            )}
          />

          {/* Right Icons */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {/* Character Count */}
            {showCharacterCount && maxLength && (
              <motion.span
                className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  characterCount > maxLength * 0.8
                    ? "text-orange-600 bg-orange-100"
                    : "text-gray-500 bg-gray-100",
                )}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                {characterCount}/{maxLength}
              </motion.span>
            )}

            {/* Sound Toggle */}
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

            {/* Password Toggle */}
            {showPasswordToggle && type === "password" && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500" />
                )}
              </button>
            )}

            {/* Right Icon */}
            {RightIcon && (
              <RightIcon
                className={cn(
                  "w-4 h-4 transition-colors duration-200",
                  isFocused ? "text-jungle" : "text-gray-400",
                )}
              />
            )}
          </div>

          {/* Fun Mode Animations */}
          {funMode && isFocused && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute -top-2 -right-2 text-lg animate-bounce">
                ✨
              </div>
              <div className="absolute -top-2 -left-2 text-lg animate-pulse">
                🌟
              </div>
            </motion.div>
          )}

          {/* Loading indicator for validation */}
          {isValidating && (
            <motion.div
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <motion.div
                className="w-4 h-4 border-2 border-jungle/30 border-t-jungle rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          )}
        </div>

        {/* Password Strength Meter */}
        <AnimatePresence>{renderPasswordStrength()}</AnimatePresence>

        {/* Input Assistance */}
        {inputAssistance === "auto" && isFocused && type === "email" && (
          <motion.div
            className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            💡 Tip: Make sure to include @ and a domain like .com
          </motion.div>
        )}
      </FormField>
    );
  },
);

EnhancedInput.displayName = "EnhancedInput";

export default EnhancedInput;
