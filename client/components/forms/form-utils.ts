// Form Utility Functions
// Helper functions for form validation, formatting, and data management

import { z } from 'zod';

// Generate unique form field IDs
export const generateFormId = (prefix = 'form'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Validate a specific form step
export const validateFormStep = async (
  stepData: Record<string, any>,
  schema: z.ZodSchema,
  stepFields: string[]
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
  try {
    // Extract only the fields for this step
    const stepOnlyData = stepFields.reduce((acc, field) => {
      if (stepData.hasOwnProperty(field)) {
        acc[field] = stepData[field];
      }
      return acc;
    }, {} as Record<string, any>);

    // Validate the step data
    await schema.parseAsync(stepOnlyData);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          const fieldName = err.path[0] as string;
          if (stepFields.includes(fieldName)) {
            errors[fieldName] = err.message;
          }
        }
      });
      return { isValid: Object.keys(errors).length === 0, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
};

// Format form data for submission
export const formatFormData = (
  data: Record<string, any>,
  options: {
    removeEmpty?: boolean;
    trimStrings?: boolean;
    convertNumbers?: boolean;
    dateFormat?: 'iso' | 'unix' | 'custom';
    customDateFormatter?: (date: Date) => string;
  } = {}
): Record<string, any> => {
  const {
    removeEmpty = true,
    trimStrings = true,
    convertNumbers = true,
    dateFormat = 'iso',
    customDateFormatter,
  } = options;

  const formatValue = (value: any): any => {
    // Handle null/undefined
    if (value === null || value === undefined) {
      return removeEmpty ? undefined : value;
    }

    // Handle strings
    if (typeof value === 'string') {
      const trimmed = trimStrings ? value.trim() : value;
      if (removeEmpty && trimmed === '') {
        return undefined;
      }
      
      // Try to convert string numbers if enabled
      if (convertNumbers && /^\d+(\.\d+)?$/.test(trimmed)) {
        const num = parseFloat(trimmed);
        return isNaN(num) ? trimmed : num;
      }
      
      return trimmed;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      const formatted = value.map(formatValue).filter(v => v !== undefined);
      return removeEmpty && formatted.length === 0 ? undefined : formatted;
    }

    // Handle dates
    if (value instanceof Date) {
      switch (dateFormat) {
        case 'unix':
          return Math.floor(value.getTime() / 1000);
        case 'custom':
          return customDateFormatter ? customDateFormatter(value) : value.toISOString();
        case 'iso':
        default:
          return value.toISOString();
      }
    }

    // Handle objects
    if (typeof value === 'object' && value !== null) {
      const formatted: Record<string, any> = {};
      Object.entries(value).forEach(([key, val]) => {
        const formattedVal = formatValue(val);
        if (formattedVal !== undefined) {
          formatted[key] = formattedVal;
        }
      });
      return removeEmpty && Object.keys(formatted).length === 0 ? undefined : formatted;
    }

    return value;
  };

  const result: Record<string, any> = {};
  Object.entries(data).forEach(([key, value]) => {
    const formatted = formatValue(value);
    if (formatted !== undefined) {
      result[key] = formatted;
    }
  });

  return result;
};

// Sanitize form input to prevent XSS and other issues
export const sanitizeFormInput = (
  input: string,
  options: {
    allowHtml?: boolean;
    maxLength?: number;
    allowedChars?: RegExp;
    stripEmojis?: boolean;
  } = {}
): string => {
  const {
    allowHtml = false,
    maxLength,
    allowedChars,
    stripEmojis = false,
  } = options;

  let sanitized = input;

  // Basic XSS prevention
  if (!allowHtml) {
    sanitized = sanitized
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Strip emojis if requested
  if (stripEmojis) {
    sanitized = sanitized.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
  }

  // Apply character filter
  if (allowedChars) {
    sanitized = sanitized.replace(new RegExp(`[^${allowedChars.source}]`, 'g'), '');
  }

  // Truncate if max length specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized.trim();
};

// Deep clone form data
export const cloneFormData = <T>(data: T): T => {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (data instanceof Date) {
    return new Date(data.getTime()) as any;
  }

  if (Array.isArray(data)) {
    return data.map(cloneFormData) as any;
  }

  const cloned = {} as T;
  Object.keys(data as any).forEach((key) => {
    (cloned as any)[key] = cloneFormData((data as any)[key]);
  });

  return cloned;
};

// Compare form data for changes
export const hasFormDataChanged = (
  original: Record<string, any>,
  current: Record<string, any>,
  ignoreFields: string[] = []
): boolean => {
  const filterData = (data: Record<string, any>) => {
    const filtered = { ...data };
    ignoreFields.forEach(field => delete filtered[field]);
    return filtered;
  };

  const originalFiltered = filterData(original);
  const currentFiltered = filterData(current);

  return JSON.stringify(originalFiltered) !== JSON.stringify(currentFiltered);
};

// Get changed fields between two form states
export const getChangedFields = (
  original: Record<string, any>,
  current: Record<string, any>
): string[] => {
  const changed: string[] = [];

  // Check all fields in current
  Object.keys(current).forEach(key => {
    if (JSON.stringify(original[key]) !== JSON.stringify(current[key])) {
      changed.push(key);
    }
  });

  // Check for removed fields
  Object.keys(original).forEach(key => {
    if (!(key in current)) {
      changed.push(key);
    }
  });

  return changed;
};

// Merge form data with validation
export const mergeFormData = (
  ...dataSources: Record<string, any>[]
): Record<string, any> => {
  const merged: Record<string, any> = {};

  dataSources.forEach(data => {
    if (data && typeof data === 'object') {
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          merged[key] = value;
        }
      });
    }
  });

  return merged;
};

// Generate form summary for display
export const generateFormSummary = (
  data: Record<string, any>,
  labels: Record<string, string> = {},
  groupings: Record<string, string[]> = {}
): Record<string, { label: string; value: any; group?: string }> => {
  const summary: Record<string, { label: string; value: any; group?: string }> = {};

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      const label = labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      const group = Object.entries(groupings).find(([, fields]) => fields.includes(key))?.[0];
      
      summary[key] = {
        label,
        value: formatValueForDisplay(value),
        group,
      };
    }
  });

  return summary;
};

// Format value for human-readable display
const formatValueForDisplay = (value: any): string => {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : 'None selected';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
};

// Validate file uploads
export const validateFileUpload = (
  file: File,
  options: {
    maxSize?: number; // bytes
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): { isValid: boolean; error?: string } => {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        isValid: false,
        error: `File extension .${extension} is not allowed`,
      };
    }
  }

  return { isValid: true };
};

// Debounce function for form validation
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for form events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Local storage helpers for form persistence
export const FormPersistence = {
  save: (key: string, data: any): void => {
    try {
      localStorage.setItem(`form_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.warn('Failed to save form data to localStorage:', error);
    }
  },

  load: (key: string): any => {
    try {
      const stored = localStorage.getItem(`form_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.data;
      }
    } catch (error) {
      console.warn('Failed to load form data from localStorage:', error);
    }
    return null;
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(`form_${key}`);
    } catch (error) {
      console.warn('Failed to remove form data from localStorage:', error);
    }
  },

  clear: (): void => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('form_'));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear form data from localStorage:', error);
    }
  },
};
