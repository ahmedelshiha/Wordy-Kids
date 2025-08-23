// Enhanced FormField Component for Educational Applications
// Provides consistent styling, validation feedback, and accessibility

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertCircle, Info, Sparkles, Zap } from "lucide-react";

export interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  hint?: string;
  required?: boolean;
  isValid?: boolean;
  isValidating?: boolean;
  className?: string;
  id: string;
  // Educational theming
  theme?: "jungle" | "ocean" | "space" | "default";
  showSuccessAnimation?: boolean;
  // Accessibility
  ariaDescribedBy?: string;
  // Learning context
  difficulty?: "easy" | "medium" | "hard";
  encouragementLevel?: "subtle" | "moderate" | "high";
}

const themeStyles = {
  jungle: {
    wrapper: "border-jungle/20 bg-jungle/5 focus-within:border-jungle/40",
    label: "text-jungle-dark",
    success: "text-jungle border-jungle/30 bg-jungle/10",
    error: "text-red-600 border-red-300 bg-red-50",
    hint: "text-jungle/70",
  },
  ocean: {
    wrapper: "border-blue-200 bg-blue-50/50 focus-within:border-blue-400",
    label: "text-blue-800",
    success: "text-blue-600 border-blue-300 bg-blue-50",
    error: "text-red-600 border-red-300 bg-red-50",
    hint: "text-blue-600",
  },
  space: {
    wrapper: "border-purple-200 bg-purple-50/50 focus-within:border-purple-400",
    label: "text-purple-800",
    success: "text-purple-600 border-purple-300 bg-purple-50",
    error: "text-red-600 border-red-300 bg-red-50",
    hint: "text-purple-600",
  },
  default: {
    wrapper: "border-gray-200 bg-gray-50/50 focus-within:border-gray-400",
    label: "text-gray-700",
    success: "text-green-600 border-green-300 bg-green-50",
    error: "text-red-600 border-red-300 bg-red-50",
    hint: "text-gray-600",
  },
};

const difficultyIndicators = {
  easy: { emoji: "🌟", color: "text-green-500", label: "Easy" },
  medium: { emoji: "⚡", color: "text-yellow-500", label: "Medium" },
  hard: { emoji: "🏆", color: "text-red-500", label: "Challenge" },
};

const encouragementMessages = {
  subtle: {
    validating: "Checking...",
    success: "Perfect!",
    error: "Let's try again!",
  },
  moderate: {
    validating: "🔍 Checking your answer...",
    success: "🌟 Great job!",
    error: "🤔 Almost there! Try again!",
  },
  high: {
    validating: "🔍 Our jungle helpers are checking this...",
    success: "🎉 Amazing work, brave explorer!",
    error: "🦁 No worries! Every explorer learns by trying!",
  },
};

export const FormField: React.FC<FormFieldProps> = ({
  children,
  label,
  description,
  error,
  success,
  hint,
  required = false,
  isValid,
  isValidating = false,
  className,
  id,
  theme = "jungle",
  showSuccessAnimation = true,
  ariaDescribedBy,
  difficulty,
  encouragementLevel = "moderate",
}) => {
  const styles = themeStyles[theme];
  const encouragement = encouragementMessages[encouragementLevel];

  const fieldState = error
    ? "error"
    : success || isValid
      ? "success"
      : "default";

  // Generate descriptive IDs for accessibility
  const errorId = `${id}-error`;
  const successId = `${id}-success`;
  const hintId = `${id}-hint`;
  const descriptionId = `${id}-description`;

  const ariaDescribedByIds = [
    ariaDescribedBy,
    description ? descriptionId : null,
    hint ? hintId : null,
    error ? errorId : null,
    success ? successId : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label with difficulty indicator */}
      {label && (
        <div className="flex items-center justify-between">
          <Label
            htmlFor={id}
            className={cn(
              "text-sm font-medium flex items-center gap-2",
              styles.label,
              required && 'after:content-["*"] after:text-red-500 after:ml-1',
            )}
          >
            {label}
            {difficulty && (
              <motion.span
                className={cn(
                  "text-xs px-2 py-1 rounded-full bg-white/60 border flex items-center gap-1",
                  difficultyIndicators[difficulty].color,
                )}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              >
                <span>{difficultyIndicators[difficulty].emoji}</span>
                <span>{difficultyIndicators[difficulty].label}</span>
              </motion.span>
            )}
          </Label>

          {/* Validation state indicator */}
          <div className="flex items-center gap-1">
            {isValidating && (
              <motion.div
                className="flex items-center gap-1 text-xs text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="w-3 h-3 border border-gray-300 rounded-full border-t-jungle"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>{encouragement.validating}</span>
              </motion.div>
            )}

            {!isValidating && isValid && showSuccessAnimation && (
              <motion.div
                className="flex items-center gap-1 text-xs text-jungle"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <CheckCircle className="w-3 h-3" />
                <span>{encouragement.success}</span>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {description && (
        <p id={descriptionId} className="text-sm text-gray-600 leading-relaxed">
          {description}
        </p>
      )}

      {/* Input wrapper with enhanced styling */}
      <div
        className={cn(
          "relative rounded-lg border-2 transition-all duration-200",
          styles.wrapper,
          fieldState === "error" && "border-red-300 bg-red-50/50",
          fieldState === "success" && "border-jungle/30 bg-jungle/5",
          isValidating && "border-blue-300 bg-blue-50/50",
        )}
      >
        {children}

        {/* Animated border glow for success */}
        <AnimatePresence>
          {fieldState === "success" && showSuccessAnimation && (
            <motion.div
              className="absolute inset-0 rounded-lg border-2 border-jungle/40"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{
                opacity: [0, 0.5, 0],
                scale: [0.95, 1, 1.05],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, times: [0, 0.5, 1] }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Feedback messages */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            id={errorId}
            className={cn(
              "flex items-start gap-2 p-3 rounded-lg border text-sm",
              styles.error,
            )}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && !error && (
          <motion.div
            key="success"
            id={successId}
            className={cn(
              "flex items-start gap-2 p-3 rounded-lg border text-sm",
              styles.success,
            )}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            role="alert"
            aria-live="polite"
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <span>{success}</span>
              {showSuccessAnimation && (
                <motion.span
                  className="ml-2 inline-block"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Sparkles className="w-4 h-4 inline text-yellow-500" />
                </motion.span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helpful hint */}
      {hint && !error && !success && (
        <div
          id={hintId}
          className={cn(
            "flex items-start gap-2 text-sm p-2 rounded-lg bg-white/60 border border-gray-200",
            styles.hint,
          )}
        >
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{hint}</span>
        </div>
      )}

      {/* Hidden input for screen readers to announce aria-describedby */}
      <div id={id + "-aria-description"} className="sr-only" aria-hidden="true">
        {ariaDescribedByIds}
      </div>
    </div>
  );
};

// Hook for managing form field state
export const useFormField = (initialValue: string = "") => {
  const [value, setValue] = React.useState(initialValue);
  const [error, setError] = React.useState<string>("");
  const [success, setSuccess] = React.useState<string>("");
  const [isValidating, setIsValidating] = React.useState(false);
  const [isValid, setIsValid] = React.useState(false);
  const [isTouched, setIsTouched] = React.useState(false);

  const validate = React.useCallback(
    async (
      validationFn: (
        value: string,
      ) =>
        | Promise<{ isValid: boolean; message: string }>
        | { isValid: boolean; message: string },
    ) => {
      if (!isTouched) return;

      setIsValidating(true);
      setError("");
      setSuccess("");

      try {
        const result = await Promise.resolve(validationFn(value));

        if (result.isValid) {
          setIsValid(true);
          setSuccess(result.message);
          setError("");
        } else {
          setIsValid(false);
          setError(result.message);
          setSuccess("");
        }
      } catch (err) {
        setIsValid(false);
        setError("Validation failed");
        setSuccess("");
      } finally {
        setIsValidating(false);
      }
    },
    [value, isTouched],
  );

  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (!isTouched) setIsTouched(true);
    setError("");
    setSuccess("");
    setIsValid(false);
  };

  const reset = () => {
    setValue(initialValue);
    setError("");
    setSuccess("");
    setIsValidating(false);
    setIsValid(false);
    setIsTouched(false);
  };

  return {
    value,
    error,
    success,
    isValidating,
    isValid,
    isTouched,
    setValue: handleChange,
    validate,
    reset,
  };
};

export default FormField;
