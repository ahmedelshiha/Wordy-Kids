// FormActions Component for form submission, navigation, and action buttons
// Provides consistent styling and behavior for form controls

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Check,
  X,
  RotateCcw,
  Upload,
  Download,
  Eye,
  EyeOff,
  Settings,
  HelpCircle,
  Sparkles,
  Zap,
} from "lucide-react";

export interface ActionButton {
  id: string;
  label: string;
  onClick: () => void | Promise<void>;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  loading?: boolean;
  tooltip?: string;
  badge?: string | number;
  hidden?: boolean;
  confirmMessage?: string;
  successMessage?: string;
  // Educational features
  difficulty?: "easy" | "medium" | "hard";
  points?: number;
  celebration?: boolean;
}

export interface FormActionsProps {
  // Primary actions
  onSubmit?: () => void | Promise<void>;
  onCancel?: () => void;
  onReset?: () => void;
  onSave?: () => void;

  // Navigation (for multi-step forms)
  onNext?: () => void;
  onPrevious?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;

  // Form state
  isSubmitting?: boolean;
  isValid?: boolean;
  isDirty?: boolean;
  hasErrors?: boolean;

  // Custom actions
  customActions?: ActionButton[];

  // Labels and text
  submitLabel?: string;
  cancelLabel?: string;
  nextLabel?: string;
  previousLabel?: string;
  saveLabel?: string;
  resetLabel?: string;

  // Layout
  layout?: "inline" | "stacked" | "spread" | "center";
  spacing?: "compact" | "normal" | "relaxed";

  // Visual styling
  theme?: "jungle" | "ocean" | "space" | "rainbow";
  variant?: "default" | "floating" | "sticky" | "minimal";

  // Educational features
  showProgress?: boolean;
  currentStep?: number;
  totalSteps?: number;
  pointsEarned?: number;
  celebrateSuccess?: boolean;

  // Accessibility
  ariaLabel?: string;

  className?: string;
  id?: string;
}

const themeStyles = {
  jungle: {
    primary: "bg-jungle hover:bg-jungle-dark text-white",
    secondary: "border-jungle text-jungle hover:bg-jungle/10",
    accent: "text-jungle",
  },
  ocean: {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "border-blue-600 text-blue-600 hover:bg-blue-50",
    accent: "text-blue-600",
  },
  space: {
    primary: "bg-purple-600 hover:bg-purple-700 text-white",
    secondary: "border-purple-600 text-purple-600 hover:bg-purple-50",
    accent: "text-purple-600",
  },
  rainbow: {
    primary:
      "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white",
    secondary: "border-pink-500 text-pink-600 hover:bg-pink-50",
    accent: "text-pink-600",
  },
};

const layoutStyles = {
  inline: "flex items-center gap-3",
  stacked: "flex flex-col gap-3",
  spread: "flex items-center justify-between",
  center: "flex items-center justify-center gap-3",
};

const spacingStyles = {
  compact: "gap-2",
  normal: "gap-3",
  relaxed: "gap-4",
};

const FormActions: React.FC<FormActionsProps> = ({
  // Primary actions
  onSubmit,
  onCancel,
  onReset,
  onSave,

  // Navigation
  onNext,
  onPrevious,
  canGoNext = true,
  canGoPrevious = true,

  // Form state
  isSubmitting = false,
  isValid = true,
  isDirty = false,
  hasErrors = false,

  // Custom actions
  customActions = [],

  // Labels
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  nextLabel = "Next",
  previousLabel = "Previous",
  saveLabel = "Save",
  resetLabel = "Reset",

  // Layout
  layout = "inline",
  spacing = "normal",

  // Visual styling
  theme = "jungle",
  variant = "default",

  // Educational features
  showProgress = false,
  currentStep,
  totalSteps,
  pointsEarned = 0,
  celebrateSuccess = false,

  // Accessibility
  ariaLabel = "Form actions",

  className,
  id,
}) => {
  const styles = themeStyles[theme];
  const [celebrationActive, setCelebrationActive] = React.useState(false);

  // Handle celebration animation
  React.useEffect(() => {
    if (celebrateSuccess && pointsEarned > 0) {
      setCelebrationActive(true);
      setTimeout(() => setCelebrationActive(false), 2000);
    }
  }, [celebrateSuccess, pointsEarned]);

  // Handle action with confirmation
  const handleActionWithConfirmation = async (action: ActionButton) => {
    if (action.confirmMessage) {
      if (!confirm(action.confirmMessage)) return;
    }

    try {
      await action.onClick();

      if (action.successMessage) {
        // Show success feedback (you might want to use a toast library)
        console.log(action.successMessage);
      }

      // Celebration for educational features
      if (action.celebration && action.points) {
        setCelebrationActive(true);
        setTimeout(() => setCelebrationActive(false), 1500);
      }
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  // Render action button
  const renderActionButton = (action: ActionButton) => {
    if (action.hidden) return null;

    const Icon = action.icon;

    return (
      <motion.div
        key={action.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          variant={action.variant || "outline"}
          size={action.size || "default"}
          disabled={action.disabled || action.loading}
          onClick={() => handleActionWithConfirmation(action)}
          className={cn(
            "relative",
            action.difficulty === "hard" && "ring-2 ring-red-300",
            action.difficulty === "medium" && "ring-2 ring-yellow-300",
            action.difficulty === "easy" && "ring-2 ring-green-300",
          )}
          title={action.tooltip}
        >
          {action.loading ? (
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            <>
              {Icon && <Icon className="w-4 h-4 mr-2" />}
              {action.label}
              {action.badge && (
                <Badge
                  variant="secondary"
                  className="ml-2 text-xs px-1.5 py-0.5"
                >
                  {action.badge}
                </Badge>
              )}
            </>
          )}
        </Button>
      </motion.div>
    );
  };

  // Container classes based on variant
  const getContainerClasses = () => {
    const baseClasses = cn(
      layoutStyles[layout],
      spacingStyles[spacing],
      className,
    );

    switch (variant) {
      case "floating":
        return cn(
          baseClasses,
          "fixed bottom-6 right-6 bg-white shadow-lg rounded-lg p-4 border z-50",
        );
      case "sticky":
        return cn(
          baseClasses,
          "sticky bottom-0 bg-white border-t p-4 backdrop-blur-sm",
        );
      case "minimal":
        return cn(baseClasses, "p-2");
      default:
        return cn(baseClasses, "p-4");
    }
  };

  return (
    <div
      className={getContainerClasses()}
      id={id}
      role="group"
      aria-label={ariaLabel}
    >
      {/* Progress indicator for multi-step forms */}
      {showProgress && currentStep && totalSteps && (
        <div className="flex-1 max-w-xs">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>
              Step {currentStep} of {totalSteps}
            </span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-jungle h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center gap-2">
        {onPrevious && (
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className={styles.secondary}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {previousLabel}
          </Button>
        )}

        {/* Custom actions */}
        <AnimatePresence>
          {customActions.map(renderActionButton)}
        </AnimatePresence>

        {/* Utility actions */}
        {onSave && isDirty && (
          <Button
            variant="outline"
            onClick={onSave}
            disabled={hasErrors}
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveLabel}
          </Button>
        )}

        {onReset && isDirty && (
          <Button
            variant="ghost"
            onClick={onReset}
            className="text-gray-600 hover:text-gray-800"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {resetLabel}
          </Button>
        )}

        {/* Primary actions */}
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            <X className="w-4 h-4 mr-2" />
            {cancelLabel}
          </Button>
        )}

        {onNext && !onSubmit && (
          <Button
            onClick={onNext}
            disabled={!canGoNext || hasErrors}
            className={styles.primary}
          >
            {nextLabel}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}

        {onSubmit && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onSubmit}
              disabled={!isValid || hasErrors || isSubmitting}
              className={cn(styles.primary, "relative overflow-hidden")}
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {submitLabel}
                </>
              )}

              {/* Celebration overlay */}
              <AnimatePresence>
                {celebrationActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        )}
      </div>

      {/* Points display */}
      {pointsEarned > 0 && (
        <AnimatePresence>
          <motion.div
            className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full border border-yellow-300"
            initial={{ opacity: 0, scale: 0, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0, x: 20 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Zap className="w-4 h-4" />
            <span className="font-bold">{pointsEarned} points earned!</span>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Form status indicators */}
      {variant !== "minimal" && (
        <div className="flex items-center gap-2 text-xs">
          {isDirty && (
            <Badge variant="outline" className="text-blue-600 border-blue-300">
              Unsaved changes
            </Badge>
          )}
          {hasErrors && (
            <Badge variant="outline" className="text-red-600 border-red-300">
              ⚠️ Errors found
            </Badge>
          )}
          {isValid && !hasErrors && isDirty && (
            <Badge
              variant="outline"
              className="text-green-600 border-green-300"
            >
              ✅ Ready to submit
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default FormActions;
