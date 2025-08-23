// Enhanced Form Hook for comprehensive form state management
// Provides validation, submission, persistence, and educational features

import { useState, useCallback, useEffect, useRef } from 'react';
import { z } from 'zod';
import { FormValidator } from '@/lib/form-validation';

export interface FormField {
  value: any;
  error?: string;
  touched: boolean;
  isValidating: boolean;
  isValid: boolean;
}

export interface EnhancedFormState {
  fields: Record<string, FormField>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  hasErrors: boolean;
  submitCount: number;
  
  // Educational features
  pointsEarned: number;
  completionPercentage: number;
  timeSpent: number; // in seconds
  helpRequestCount: number;
  
  // Multi-step form support
  currentStep: number;
  totalSteps: number;
  stepsCompleted: Set<number>;
  
  // Persistence
  lastSaved?: Date;
  autoSaveEnabled: boolean;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  fieldResults: Record<string, {
    isValid: boolean;
    message: string;
    icon: string;
  }>;
}

export interface EnhancedFormOptions {
  // Validation
  schema?: z.ZodSchema;
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit' | 'all';
  validationDelay?: number; // ms
  
  // Persistence
  persistKey?: string;
  autoSave?: boolean;
  autoSaveInterval?: number; // ms
  
  // Educational features
  pointsSystem?: boolean;
  trackTime?: boolean;
  showProgress?: boolean;
  
  // Multi-step support
  steps?: number;
  stepValidation?: boolean;
  
  // Accessibility
  announceErrors?: boolean;
  pronunciationEnabled?: boolean;
  
  // Callbacks
  onSubmit?: (data: any) => Promise<void> | void;
  onFieldChange?: (fieldName: string, value: any) => void;
  onValidationChange?: (isValid: boolean, errors: Record<string, string>) => void;
  onStepChange?: (step: number) => void;
  onAutoSave?: (data: any) => Promise<void> | void;
}

export const useEnhancedForm = (
  initialValues: Record<string, any> = {},
  options: EnhancedFormOptions = {}
) => {
  const {
    schema,
    validationMode = 'onChange',
    validationDelay = 300,
    persistKey,
    autoSave = false,
    autoSaveInterval = 30000,
    pointsSystem = false,
    trackTime = false,
    showProgress = false,
    steps = 1,
    stepValidation = false,
    announceErrors = false,
    pronunciationEnabled = false,
    onSubmit,
    onFieldChange,
    onValidationChange,
    onStepChange,
    onAutoSave,
  } = options;

  // Core form state
  const [formState, setFormState] = useState<EnhancedFormState>(() => {
    const savedData = persistKey ? localStorage.getItem(`form_${persistKey}`) : null;
    const savedValues = savedData ? JSON.parse(savedData).values : initialValues;
    
    return {
      fields: Object.keys({ ...initialValues, ...savedValues }).reduce((acc, key) => {
        acc[key] = {
          value: savedValues[key] ?? initialValues[key] ?? '',
          touched: false,
          isValidating: false,
          isValid: true,
          error: undefined,
        };
        return acc;
      }, {} as Record<string, FormField>),
      isSubmitting: false,
      isValid: true,
      isDirty: false,
      hasErrors: false,
      submitCount: 0,
      pointsEarned: 0,
      completionPercentage: 0,
      timeSpent: 0,
      helpRequestCount: 0,
      currentStep: 1,
      totalSteps: steps,
      stepsCompleted: new Set(),
      autoSaveEnabled: autoSave,
    };
  });

  // Refs for tracking
  const validationTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const formStartTime = useRef<Date>(new Date());
  const autoSaveTimeout = useRef<NodeJS.Timeout>();

  // Calculate derived state
  const values = Object.keys(formState.fields).reduce((acc, key) => {
    acc[key] = formState.fields[key].value;
    return acc;
  }, {} as Record<string, any>);

  const errors = Object.keys(formState.fields).reduce((acc, key) => {
    if (formState.fields[key].error) {
      acc[key] = formState.fields[key].error;
    }
    return acc;
  }, {} as Record<string, string>);

  // Time tracking
  useEffect(() => {
    if (!trackTime) return;

    const interval = setInterval(() => {
      setFormState(prev => ({
        ...prev,
        timeSpent: Math.floor((Date.now() - formStartTime.current.getTime()) / 1000),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [trackTime]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !persistKey) return;

    const scheduleAutoSave = () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }

      autoSaveTimeout.current = setTimeout(() => {
        const saveData = {
          values,
          timestamp: new Date().toISOString(),
          formState: {
            timeSpent: formState.timeSpent,
            pointsEarned: formState.pointsEarned,
            currentStep: formState.currentStep,
          },
        };

        localStorage.setItem(`form_${persistKey}`, JSON.stringify(saveData));
        
        setFormState(prev => ({
          ...prev,
          lastSaved: new Date(),
        }));

        onAutoSave?.(values);
      }, autoSaveInterval);
    };

    scheduleAutoSave();

    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
    };
  }, [values, autoSave, persistKey, autoSaveInterval, onAutoSave, formState.timeSpent, formState.pointsEarned, formState.currentStep]);

  // Validation function
  const validateField = useCallback(async (
    fieldName: string,
    value: any,
    immediate = false
  ): Promise<{ isValid: boolean; message: string; icon: string }> => {
    try {
      if (schema) {
        const fieldSchema = (schema as any).shape?.[fieldName];
        if (fieldSchema) {
          fieldSchema.parse(value);
        }
      }

      // Custom validation based on field type
      const validationResult = FormValidator.validateEmail(value);
      return validationResult;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          message: error.errors[0]?.message || 'Validation failed',
          icon: '⚠️',
        };
      }
      return {
        isValid: false,
        message: 'Validation error',
        icon: '⚠️',
      };
    }
  }, [schema]);

  // Set field value with validation
  const setFieldValue = useCallback((fieldName: string, value: any) => {
    setFormState(prev => {
      const newFields = {
        ...prev.fields,
        [fieldName]: {
          ...prev.fields[fieldName],
          value,
          touched: true,
        },
      };

      const newState = {
        ...prev,
        fields: newFields,
        isDirty: true,
      };

      // Calculate completion percentage
      if (showProgress) {
        const filledFields = Object.values(newFields).filter(field => 
          field.value !== null && field.value !== undefined && field.value !== ''
        ).length;
        newState.completionPercentage = Math.round((filledFields / Object.keys(newFields).length) * 100);
      }

      return newState;
    });

    // Trigger validation
    if (validationMode === 'onChange' || validationMode === 'all') {
      if (validationTimeouts.current[fieldName]) {
        clearTimeout(validationTimeouts.current[fieldName]);
      }

      validationTimeouts.current[fieldName] = setTimeout(async () => {
        setFormState(prev => ({
          ...prev,
          fields: {
            ...prev.fields,
            [fieldName]: {
              ...prev.fields[fieldName],
              isValidating: true,
            },
          },
        }));

        const result = await validateField(fieldName, value);

        setFormState(prev => {
          const newFields = {
            ...prev.fields,
            [fieldName]: {
              ...prev.fields[fieldName],
              isValidating: false,
              isValid: result.isValid,
              error: result.isValid ? undefined : result.message,
            },
          };

          const hasErrors = Object.values(newFields).some(field => field.error);
          const isValid = Object.values(newFields).every(field => field.isValid);

          return {
            ...prev,
            fields: newFields,
            hasErrors,
            isValid,
          };
        });

        // Award points for valid fields
        if (pointsSystem && result.isValid) {
          setFormState(prev => ({
            ...prev,
            pointsEarned: prev.pointsEarned + 5,
          }));
        }
      }, validationDelay);
    }

    onFieldChange?.(fieldName, value);
  }, [validateField, validationMode, validationDelay, onFieldChange, showProgress, pointsSystem]);

  // Set multiple field values
  const setValues = useCallback((newValues: Record<string, any>) => {
    Object.entries(newValues).forEach(([fieldName, value]) => {
      setFieldValue(fieldName, value);
    });
  }, [setFieldValue]);

  // Set field error
  const setFieldError = useCallback((fieldName: string, error: string) => {
    setFormState(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldName]: {
          ...prev.fields[fieldName],
          error,
          isValid: false,
        },
      },
      hasErrors: true,
    }));
  }, []);

  // Clear field error
  const clearFieldError = useCallback((fieldName: string) => {
    setFormState(prev => {
      const newFields = {
        ...prev.fields,
        [fieldName]: {
          ...prev.fields[fieldName],
          error: undefined,
          isValid: true,
        },
      };

      const hasErrors = Object.values(newFields).some(field => field.error);

      return {
        ...prev,
        fields: newFields,
        hasErrors,
      };
    });
  }, []);

  // Validate all fields
  const validateForm = useCallback(async (): Promise<FormValidationResult> => {
    const fieldResults: Record<string, { isValid: boolean; message: string; icon: string }> = {};
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    for (const [fieldName, field] of Object.entries(formState.fields)) {
      const result = await validateField(fieldName, field.value, true);
      fieldResults[fieldName] = result;
      
      if (!result.isValid) {
        errors[fieldName] = result.message;
      }
    }

    const isValid = Object.keys(errors).length === 0;

    // Update form state
    setFormState(prev => ({
      ...prev,
      fields: Object.keys(prev.fields).reduce((acc, fieldName) => {
        acc[fieldName] = {
          ...prev.fields[fieldName],
          error: errors[fieldName],
          isValid: !errors[fieldName],
          touched: true,
        };
        return acc;
      }, {} as Record<string, FormField>),
      isValid,
      hasErrors: !isValid,
    }));

    onValidationChange?.(isValid, errors);

    return { isValid, errors, warnings, fieldResults };
  }, [formState.fields, validateField, onValidationChange]);

  // Submit form
  const handleSubmit = useCallback(async () => {
    setFormState(prev => ({
      ...prev,
      isSubmitting: true,
      submitCount: prev.submitCount + 1,
    }));

    try {
      const validation = await validateForm();
      
      if (!validation.isValid) {
        if (announceErrors && 'speechSynthesis' in window) {
          const errorCount = Object.keys(validation.errors).length;
          const utterance = new SpeechSynthesisUtterance(
            `Please fix ${errorCount} error${errorCount > 1 ? 's' : ''} before submitting`
          );
          utterance.volume = 0.5;
          speechSynthesis.speak(utterance);
        }
        return { success: false, errors: validation.errors };
      }

      await onSubmit?.(values);

      // Success - award completion points
      if (pointsSystem) {
        setFormState(prev => ({
          ...prev,
          pointsEarned: prev.pointsEarned + 50,
        }));
      }

      // Clear persistence data on successful submit
      if (persistKey) {
        localStorage.removeItem(`form_${persistKey}`);
      }

      return { success: true, errors: {} };
    } catch (error) {
      console.error('Form submission error:', error);
      return { success: false, errors: { general: 'Submission failed' } };
    } finally {
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
      }));
    }
  }, [validateForm, onSubmit, values, announceErrors, pointsSystem, persistKey]);

  // Reset form
  const reset = useCallback((newValues = initialValues) => {
    setFormState({
      fields: Object.keys(newValues).reduce((acc, key) => {
        acc[key] = {
          value: newValues[key] ?? '',
          touched: false,
          isValidating: false,
          isValid: true,
          error: undefined,
        };
        return acc;
      }, {} as Record<string, FormField>),
      isSubmitting: false,
      isValid: true,
      isDirty: false,
      hasErrors: false,
      submitCount: 0,
      pointsEarned: 0,
      completionPercentage: 0,
      timeSpent: 0,
      helpRequestCount: 0,
      currentStep: 1,
      totalSteps: steps,
      stepsCompleted: new Set(),
      autoSaveEnabled: autoSave,
    });

    formStartTime.current = new Date();
  }, [initialValues, steps, autoSave]);

  // Step navigation for multi-step forms
  const goToStep = useCallback((step: number) => {
    if (step < 1 || step > formState.totalSteps) return false;

    if (stepValidation && step > formState.currentStep) {
      // Validate current step before proceeding
      validateForm().then(result => {
        if (result.isValid) {
          setFormState(prev => ({
            ...prev,
            currentStep: step,
            stepsCompleted: new Set([...prev.stepsCompleted, prev.currentStep]),
          }));
          onStepChange?.(step);
        }
      });
    } else {
      setFormState(prev => ({
        ...prev,
        currentStep: step,
      }));
      onStepChange?.(step);
    }

    return true;
  }, [formState.currentStep, formState.totalSteps, stepValidation, validateForm, onStepChange]);

  const nextStep = useCallback(() => {
    return goToStep(formState.currentStep + 1);
  }, [formState.currentStep, goToStep]);

  const previousStep = useCallback(() => {
    return goToStep(formState.currentStep - 1);
  }, [formState.currentStep, goToStep]);

  // Request help (educational feature)
  const requestHelp = useCallback((fieldName?: string) => {
    setFormState(prev => ({
      ...prev,
      helpRequestCount: prev.helpRequestCount + 1,
    }));

    if (pronunciationEnabled && fieldName && 'speechSynthesis' in window) {
      const field = formState.fields[fieldName];
      const utterance = new SpeechSynthesisUtterance(
        `Help for ${fieldName}: ${field?.error || 'This field needs your attention'}`
      );
      utterance.volume = 0.6;
      speechSynthesis.speak(utterance);
    }
  }, [formState.fields, pronunciationEnabled]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(validationTimeouts.current).forEach(clearTimeout);
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
    };
  }, []);

  return {
    // State
    formState,
    values,
    errors,
    
    // Field operations
    setFieldValue,
    setValues,
    setFieldError,
    clearFieldError,
    
    // Validation
    validateField,
    validateForm,
    
    // Form operations
    handleSubmit,
    reset,
    
    // Step navigation
    goToStep,
    nextStep,
    previousStep,
    
    // Educational features
    requestHelp,
    
    // Derived state
    canGoNext: formState.currentStep < formState.totalSteps,
    canGoPrevious: formState.currentStep > 1,
    isLastStep: formState.currentStep === formState.totalSteps,
    isFirstStep: formState.currentStep === 1,
  };
};

export default useEnhancedForm;
