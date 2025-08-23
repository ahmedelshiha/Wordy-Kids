// Enhanced Form Components Index
// Exports all form components for easy importing

// Core components
export { FormField, useFormField } from "./FormField";
export type { FormFieldProps } from "./FormField";

export { default as EnhancedInput } from "./EnhancedInput";
export type { EnhancedInputProps } from "./EnhancedInput";

export { default as EnhancedSelect } from "./EnhancedSelect";
export type { EnhancedSelectProps, SelectOption } from "./EnhancedSelect";

export { default as EnhancedCheckbox } from "./EnhancedCheckbox";
export type { EnhancedCheckboxProps } from "./EnhancedCheckbox";

export { default as EnhancedRadioGroup } from "./EnhancedRadioGroup";
export type {
  EnhancedRadioGroupProps,
  RadioOption,
} from "./EnhancedRadioGroup";

// Form validation utilities
export {
  FormValidator,
  FormSchemas,
  useFormValidation,
  ValidationMessages,
  baseSchemas,
} from "@/lib/form-validation";

// Re-export base UI components for convenience
export { Button } from "@/components/ui/button";
export { Badge } from "@/components/ui/badge";
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
export { Label } from "@/components/ui/label";
export { Textarea } from "@/components/ui/textarea";
export { Separator } from "@/components/ui/separator";

// Form composition helpers
export { default as FormSection } from "./FormSection";
export { default as FormActions } from "./FormActions";
export { default as FormProgress } from "./FormProgress";

// Hook for form state management
export { useEnhancedForm } from "./useEnhancedForm";
export type {
  EnhancedFormState,
  FormValidationResult,
} from "./useEnhancedForm";

// Educational form presets
export { default as ChildRegistrationForm } from "./presets/ChildRegistrationForm";
export { default as ParentRegistrationForm } from "./presets/ParentRegistrationForm";
export { default as LearningPreferencesForm } from "./presets/LearningPreferencesForm";
export { default as ContactForm } from "./presets/ContactForm";

// Form layout components
export { default as FormWizard } from "./FormWizard";
export { default as StepIndicator } from "./StepIndicator";

// Utility functions
export {
  validateFormStep,
  formatFormData,
  sanitizeFormInput,
  generateFormId,
} from "./form-utils";
