// Enhanced Form Validation Library for Educational Applications
// Integrates with Zod for type-safe validation

import { z } from "zod";

// Educational-themed validation messages
export const ValidationMessages = {
  required: "🌟 This field is needed for your jungle adventure!",
  email: "📧 Let's make sure this email looks right!",
  phone: "📞 Phone numbers help us stay connected!",
  minLength: (min: number) => `✏️ We need at least ${min} characters here!`,
  maxLength: (max: number) => `📝 Please keep this under ${max} characters!`,
  password: "🔐 Create a strong password to protect your learning!",
  passwordMatch: "🔄 Make sure both passwords match!",
  age: "���� Please enter your age so we can create the perfect adventure!",
  parentEmail: "👨‍👩‍👧‍👦 Parent email helps keep everyone safe!",
  childName: "🦁 What should we call our brave jungle explorer?",
  creditCard: "💳 Let's check this card number together!",
  invalidDate: "📅 This date doesn't look quite right!",
  futureDate: "⏰ This date should be in the future!",
  pastDate: "📆 This date should be in the past!",
};

// Base validation schemas
export const baseSchemas = {
  email: z
    .string()
    .min(1, ValidationMessages.required)
    .email(ValidationMessages.email),

  phone: z
    .string()
    .min(1, ValidationMessages.required)
    .regex(/^[\+]?[(]?[0-9\s\-\(\)]{10,}$/, ValidationMessages.phone),

  password: z
    .string()
    .min(8, ValidationMessages.minLength(8))
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, ValidationMessages.password),

  childName: z
    .string()
    .min(1, ValidationMessages.required)
    .min(2, ValidationMessages.minLength(2))
    .max(50, ValidationMessages.maxLength(50))
    .regex(/^[a-zA-Z\s'-]+$/, ValidationMessages.childName),

  age: z
    .number()
    .min(3, "🎈 Our jungle adventures start at age 3!")
    .max(18, "🌟 This adventure is designed for kids up to 18!"),

  parentEmail: z
    .string()
    .min(1, ValidationMessages.required)
    .email(ValidationMessages.parentEmail),

  creditCard: z
    .string()
    .min(1, ValidationMessages.required)
    .regex(/^[0-9\s]{13,19}$/, ValidationMessages.creditCard),

  futureDate: z.date().min(new Date(), ValidationMessages.futureDate),

  pastDate: z.date().max(new Date(), ValidationMessages.pastDate),
};

// Enhanced validation functions with educational context
export class FormValidator {
  // Email validation with educational feedback
  static validateEmail(email: string): {
    isValid: boolean;
    message: string;
    icon: string;
  } {
    try {
      baseSchemas.email.parse(email);
      return {
        isValid: true,
        message: "📧 Perfect email address!",
        icon: "✅",
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          message: error.errors[0].message,
          icon: "⚠️",
        };
      }
      return {
        isValid: false,
        message: ValidationMessages.email,
        icon: "⚠️",
      };
    }
  }

  // Phone validation with auto-formatting
  static validateAndFormatPhone(phone: string): {
    isValid: boolean;
    message: string;
    formatted: string;
    icon: string;
  } {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, "");

    // Format based on length
    let formatted = phone;
    if (digits.length === 10) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length === 11 && digits[0] === "1") {
      formatted = `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }

    try {
      baseSchemas.phone.parse(formatted);
      return {
        isValid: true,
        message: "📞 Great phone number!",
        formatted,
        icon: "✅",
      };
    } catch (error) {
      return {
        isValid: false,
        message: ValidationMessages.phone,
        formatted: phone,
        icon: "⚠️",
      };
    }
  }

  // Password strength validation with visual feedback
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    strength: "weak" | "medium" | "strong";
    message: string;
    checks: {
      length: boolean;
      uppercase: boolean;
      lowercase: boolean;
      number: boolean;
      special: boolean;
    };
    icon: string;
  } {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;

    let strength: "weak" | "medium" | "strong" = "weak";
    let message = "";
    let icon = "";

    if (score < 3) {
      strength = "weak";
      message = "🔐 Let's make this password stronger!";
      icon = "⚠️";
    } else if (score < 5) {
      strength = "medium";
      message = "🛡️ Good password! Add special characters for extra security!";
      icon = "👍";
    } else {
      strength = "strong";
      message = "🔒 Excellent! Your jungle treasures are well protected!";
      icon = "✅";
    }

    return {
      isValid: score >= 3,
      strength,
      message,
      checks,
      icon,
    };
  }

  // Credit card validation with type detection
  static validateCreditCard(cardNumber: string): {
    isValid: boolean;
    type: "visa" | "mastercard" | "amex" | "discover" | "unknown";
    message: string;
    formatted: string;
    icon: string;
  } {
    // Remove spaces and hyphens
    const digits = cardNumber.replace(/[\s-]/g, "");

    // Detect card type
    let type: "visa" | "mastercard" | "amex" | "discover" | "unknown" =
      "unknown";
    if (/^4/.test(digits)) type = "visa";
    else if (/^5[1-5]/.test(digits)) type = "mastercard";
    else if (/^3[47]/.test(digits)) type = "amex";
    else if (/^6(?:011|5)/.test(digits)) type = "discover";

    // Format card number
    let formatted = digits;
    if (type === "amex") {
      formatted = digits.replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3");
    } else {
      formatted = digits.replace(/(\d{4})/g, "$1 ").trim();
    }

    // Luhn algorithm validation
    const isValid = FormValidator.luhnCheck(digits);

    return {
      isValid: isValid && digits.length >= 13,
      type,
      message: isValid
        ? "💳 Perfect! Your payment method is ready!"
        : "💳 Let's double-check this card number!",
      formatted,
      icon: isValid ? "✅" : "⚠️",
    };
  }

  // Luhn algorithm for credit card validation
  private static luhnCheck(cardNumber: string): boolean {
    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  // Age validation with educational context
  static validateAge(age: number): {
    isValid: boolean;
    message: string;
    recommendations: string[];
    icon: string;
  } {
    const recommendations: string[] = [];

    if (age < 3) {
      return {
        isValid: false,
        message: "🎈 Our jungle adventures are perfect for ages 3 and up!",
        recommendations: ["Try our toddler-friendly activities instead!"],
        icon: "⚠️",
      };
    }

    if (age <= 5) {
      recommendations.push("🌟 Perfect age for basic word recognition!");
      recommendations.push("🦁 Start with animal and color words!");
    } else if (age <= 8) {
      recommendations.push("📚 Great age for reading comprehension!");
      recommendations.push("🌍 Try geography and science words!");
    } else if (age <= 12) {
      recommendations.push("🔬 Ready for advanced vocabulary!");
      recommendations.push("📖 Perfect for story creation exercises!");
    } else {
      recommendations.push("🎓 Advanced learning mode unlocked!");
      recommendations.push("💡 Help younger learners in family mode!");
    }

    return {
      isValid: true,
      message: `🎉 Welcome to your jungle adventure, ${age}-year-old explorer!`,
      recommendations,
      icon: "✅",
    };
  }
}

// Comprehensive form schemas for different use cases
export const FormSchemas = {
  // Child registration form
  childRegistration: z.object({
    childName: baseSchemas.childName,
    age: baseSchemas.age,
    parentEmail: baseSchemas.parentEmail,
    interests: z
      .array(z.string())
      .min(1, "🌟 Pick at least one interest to start your adventure!"),
    learningGoals: z.string().optional(),
  }),

  // Parent registration form
  parentRegistration: z
    .object({
      parentName: z.string().min(1, ValidationMessages.required),
      email: baseSchemas.email,
      password: baseSchemas.password,
      confirmPassword: z.string(),
      phone: baseSchemas.phone.optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: ValidationMessages.passwordMatch,
      path: ["confirmPassword"],
    }),

  // Subscription form
  subscription: z.object({
    plan: z.enum(["basic", "premium", "family"], {
      required_error: "🎯 Choose a plan that's perfect for your family!",
    }),
    paymentMethod: z.enum(["card", "paypal"], {
      required_error: "💳 How would you like to pay?",
    }),
    cardNumber: baseSchemas.creditCard.optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().min(3).max(4).optional(),
    billingAddress: z
      .object({
        street: z.string().min(1, ValidationMessages.required),
        city: z.string().min(1, ValidationMessages.required),
        state: z.string().min(1, ValidationMessages.required),
        zipCode: z.string().min(5, "📮 Please enter a valid ZIP code!"),
      })
      .optional(),
  }),

  // Contact form
  contact: z.object({
    name: z.string().min(1, ValidationMessages.required),
    email: baseSchemas.email,
    subject: z.string().min(1, ValidationMessages.required),
    message: z.string().min(10, ValidationMessages.minLength(10)),
    priority: z.enum(["low", "medium", "high"]).default("medium"),
  }),

  // Learning preferences
  learningPreferences: z.object({
    difficulty: z.enum(["easy", "medium", "hard"]),
    categories: z
      .array(z.string())
      .min(1, "🎯 Choose your favorite learning topics!"),
    sessionLength: z.number().min(5).max(60),
    reminderTimes: z.array(z.string()).optional(),
    voiceEnabled: z.boolean().default(true),
    animationsEnabled: z.boolean().default(true),
  }),
};

// Real-time validation hooks
export const useFormValidation = <T extends z.ZodTypeAny>(schema: T) => {
  const validateField = (fieldName: string, value: any) => {
    try {
      const fieldSchema = schema.shape[fieldName];
      if (fieldSchema) {
        fieldSchema.parse(value);
        return { isValid: true, message: "", icon: "✅" };
      }
      return { isValid: true, message: "", icon: "" };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          message: error.errors[0].message,
          icon: "⚠️",
        };
      }
      return { isValid: false, message: "Validation error", icon: "⚠️" };
    }
  };

  const validateForm = (data: z.infer<T>) => {
    try {
      schema.parse(data);
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            errors[err.path[0] as string] = err.message;
          }
        });
        return { isValid: false, errors };
      }
      return { isValid: false, errors: { general: "Validation failed" } };
    }
  };

  return { validateField, validateForm };
};
