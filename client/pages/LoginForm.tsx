// SECURITY FIX FOR LOGIN - Updated client/pages/LoginForm.tsx
// This works with the new secure password hashing system

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  LogIn,
  Eye,
  EyeOff,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  UserCheck,
  Sparkles,
  Heart,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNavigationHistory } from "@/hooks/useNavigationHistory";

// SECURITY IMPROVEMENT: Import crypto-js for password verification
import CryptoJS from 'crypto-js';

// Import the same security utilities used in SignUp
const SecurityUtils = {
  hashPassword: (password: string, salt: string): string => {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 512/32,
      iterations: 10000
    }).toString();
  },

  verifyPassword: (password: string, storedHash: string, salt: string): boolean => {
    const hash = SecurityUtils.hashPassword(password, salt);
    return hash === storedHash;
  },

  // Generate salt and hash for legacy user migration
  generateSalt: (): string => {
    return CryptoJS.lib.WordArray.random(128/8).toString();
  },

  generateSecureId: (): string => {
    return CryptoJS.lib.WordArray.random(16).toString();
  }
};

interface UserData {
  id: string;
  name: string;
  email: string;
  age?: number;
  username?: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  lastLogin?: string;
  isParent?: boolean;
  // Legacy field for migration
  password?: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface ValidationState {
  email: "valid" | "invalid" | "neutral";
  password: "valid" | "invalid" | "neutral";
}

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAsGuest, login } = useAuth();
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Clear navigation history when on login page (fresh start)
  const { clearHistory } = useNavigationHistory();

  useEffect(() => {
    // Clear navigation history when user comes to login page
    // This ensures a fresh start and prevents loops
    clearHistory();
  }, [clearHistory]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [validationState, setValidationState] = useState<ValidationState>({
    email: "neutral",
    password: "neutral",
  });

  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Auto-focus email input on mount
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Enhanced email validation with professional standards
  const validateEmail = (email: string) => {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!email) return "Parent email address is required";
    if (email.length > 254) return "Email address is too long";
    if (!emailRegex.test(email))
      return "Please enter a valid email address (e.g., parent@example.com)";
    return null;
  };

  // Enhanced password validation with security standards
  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length > 128)
      return "Password is too long (max 128 characters)";
    return null;
  };

  // Update validation state
  const updateValidation = (field: keyof ValidationState, value: string) => {
    const isValid =
      field === "email" ? !validateEmail(value) : !validatePassword(value);

    setValidationState((prev) => ({
      ...prev,
      [field]: value ? (isValid ? "valid" : "invalid") : "neutral",
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const trimmedValue = value.trimStart(); // Only trim leading spaces

    setFormData((prev) => ({
      ...prev,
      [name]: trimmedValue,
    }));

    // Real-time validation
    if (touched[name as keyof typeof touched]) {
      const error =
        name === "email"
          ? validateEmail(trimmedValue)
          : validatePassword(trimmedValue);

      setErrors((prev) => ({
        ...prev,
        [name]: error,
        general: undefined,
      }));
    }

    // Update validation state
    updateValidation(name as keyof ValidationState, trimmedValue);

    // Clear global message
    if (message) {
      setMessage(null);
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    const value = formData[field];
    const error =
      field === "email" ? validateEmail(value) : validatePassword(value);

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, nextField?: string) => {
    if (e.key === "Enter" && nextField) {
      e.preventDefault();
      const nextElement = document.getElementById(nextField);
      nextElement?.focus();
    }
  };

  const validateForm = () => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    const newErrors: FormErrors = {};
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    setTouched({ email: true, password: true });

    return Object.keys(newErrors).length === 0;
  };

  // Handle legacy users (those with plaintext passwords) - migrate them to secure format
  const handleLegacyLogin = async (users: UserData[], email: string, password: string): Promise<boolean> => {
    const legacyUser = users.find(u => 
      u.email?.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (legacyUser) {
      // Migrate legacy user to secure format
      console.log('⚠️ Migrating legacy user to secure password storage');
      
      const salt = SecurityUtils.generateSalt();
      const passwordHash = SecurityUtils.hashPassword(password, salt);
      
      const migratedUser: UserData = {
        id: legacyUser.id || SecurityUtils.generateSecureId(),
        name: legacyUser.name || legacyUser.username || email.split("@")[0],
        email: legacyUser.email,
        age: legacyUser.age,
        username: legacyUser.username,
        passwordHash: passwordHash,
        salt: salt,
        createdAt: legacyUser.createdAt || new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isParent: legacyUser.isParent
      };

      // Remove legacy user and add migrated user
      const updatedUsers = users.filter(u => u.email !== legacyUser.email);
      updatedUsers.push(migratedUser);
      localStorage.setItem("wordAdventureUsers", JSON.stringify(updatedUsers));

      console.log('✅ Legacy user successfully migrated and logged in');
      return true;
    }
    
    return false;
  };

  // SECURE LOGIN HANDLER
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage({
        type: "error",
        text: "Please fix the errors below",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const email = formData.email.trim();
    const password = formData.password.trim();

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Get stored users
      const storedUsers: UserData[] = JSON.parse(
        localStorage.getItem("wordAdventureUsers") || "[]"
      );

      // Check for demo users first
      const isDemoUser =
        (email === "demo@example.com" && password === "Demo123") ||
        (email === "alex@example.com" && password === "Alex123") ||
        (email === "sam@example.com" && password === "Sam123");

      if (isDemoUser) {
        // Handle demo user login
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        const userProfile = {
          id: `demo-${email.split("@")[0]}`,
          name: email.split("@")[0],
          email: email,
          type: "parent" as const,
          isGuest: false,
        };

        login(userProfile);

        setMessage({
          type: "success",
          text: "Welcome back! Taking you to your dashboard...",
        });

        setTimeout(() => {
          const returnTo =
            new URLSearchParams(location.search).get("returnTo") ||
            location.state?.from;
          const targetRoute = returnTo && returnTo !== "/" ? returnTo : "/app";

          navigate(targetRoute, {
            state: {
              loginSuccess: true,
              userEmail: email,
            },
            replace: true,
          });
        }, 1000);
        return;
      }

      // Find user by email
      const user = storedUsers.find(
        u => u.email.toLowerCase() === email.toLowerCase().trim()
      );

      if (!user) {
        setErrors({
          general: "No account found with this email address",
        });
        setMessage({
          type: "error",
          text: "No account found with this email address",
        });
        setIsLoading(false);
        return;
      }

      let isPasswordValid = false;
      let userToLogin = user;

      // Check if user has secure password hash
      if (user.passwordHash && user.salt) {
        // SECURITY IMPROVEMENT: Verify password using hash and salt
        isPasswordValid = SecurityUtils.verifyPassword(
          password,
          user.passwordHash,
          user.salt
        );
      } else if (user.password) {
        // Legacy user with plaintext password - migrate them
        if (user.password === password) {
          const migrationSuccess = await handleLegacyLogin(storedUsers, email, password);
          if (migrationSuccess) {
            // Re-get updated user data after migration
            const updatedUsers = JSON.parse(localStorage.getItem("wordAdventureUsers") || "[]");
            userToLogin = updatedUsers.find((u: UserData) => u.email.toLowerCase() === email.toLowerCase());
            isPasswordValid = true;
          }
        }
      }

      if (!isPasswordValid) {
        setErrors({
          general: "Invalid password",
        });
        setMessage({
          type: "error",
          text: "Invalid password. Please check your credentials.",
        });
        setIsLoading(false);
        return;
      }

      // Update last login time
      const updatedUser = {
        ...userToLogin,
        lastLogin: new Date().toISOString()
      };

      // Update the user in storage
      const allUsers = JSON.parse(localStorage.getItem("wordAdventureUsers") || "[]");
      const updatedUsers = allUsers.map((u: UserData) => 
        u.id === userToLogin.id ? updatedUser : u
      );
      localStorage.setItem("wordAdventureUsers", JSON.stringify(updatedUsers));

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Create user profile for auth context
      const userProfile = {
        id: userToLogin.id,
        name: userToLogin.name || userToLogin.username || email.split("@")[0],
        email: email,
        type: "parent" as const,
        isGuest: false,
      };

      // Login using auth context
      login(userProfile);

      setMessage({
        type: "success",
        text: "Welcome back! Taking you to your dashboard...",
      });

      console.log('✅ User logged in successfully with secure authentication');

      setTimeout(() => {
        // Check if there's a returnTo parameter or state
        const returnTo =
          new URLSearchParams(location.search).get("returnTo") ||
          location.state?.from;
        const targetRoute = returnTo && returnTo !== "/" ? returnTo : "/app";

        navigate(targetRoute, {
          state: {
            loginSuccess: true,
            userEmail: email,
          },
          replace: true, // Replace to avoid back button going to login
        });
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToMain = () => {
    // Clear all form state and prevent any validation
    setFormData({ email: "", password: "" });
    setErrors({});
    setMessage(null);
    setTouched({ email: false, password: false });
    setValidationState({ email: "neutral", password: "neutral" });

    // Login as guest using auth context
    loginAsGuest();

    // Check if there's a returnTo parameter
    const returnTo = new URLSearchParams(location.search).get("returnTo");
    const targetRoute = returnTo && returnTo !== "/" ? returnTo : "/app";

    navigate(targetRoute, { replace: true });
  };

  const handleForgotPassword = () => {
    if (formData.email && !validateEmail(formData.email)) {
      setMessage({
        type: "success",
        text: `Password reset instructions sent to ${formData.email}`,
      });
    } else {
      setMessage({
        type: "info",
        text: "Please enter your email address first to reset your password.",
      });
      emailInputRef.current?.focus();
    }
  };

  const getInputClassName = (field: keyof ValidationState) => {
    const baseClass =
      "pr-10 transition-all duration-300 rounded-xl px-4 py-4 text-base border-2";
    const state = validationState[field];

    if (state === "valid") {
      return `${baseClass} border-jungle focus:border-jungle focus:ring-jungle/20 focus:outline-none`;
    } else if (state === "invalid") {
      return `${baseClass} border-red-400 focus:border-red-500 focus:ring-red-500/20 focus:outline-none`;
    }
    return `${baseClass} border-gray-300 focus:border-jungle focus:ring-jungle/20 focus:outline-none placeholder:text-gray-400`;
  };

  const isFormValid =
    !Object.keys(errors).length && formData.email && formData.password;

  return (
    <div className="min-h-screen login-background flex items-center justify-center p-3 sm:p-6 md:p-8 relative overflow-hidden safe-area-padding-top safe-area-padding-bottom">
      {/* Compact Background Pattern - fewer elements on mobile */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-8 left-8 text-2xl sm:text-4xl animate-gentle-float">
          ⭐
        </div>
        <div className="absolute top-16 right-8 text-xl sm:text-3xl animate-gentle-float animation-delay-200">
          🌟
        </div>
        <div className="absolute bottom-16 left-8 text-2xl sm:text-4xl animate-gentle-float animation-delay-100">
          🎯
        </div>
        <div className="absolute bottom-8 right-8 text-xl sm:text-3xl animate-gentle-float animation-delay-300">
          🚀
        </div>
        {/* Hide some decorative elements on mobile */}
        <div className="hidden sm:block absolute top-1/2 left-8 text-2xl animate-sparkle">
          ✨
        </div>
        <div className="hidden sm:block absolute top-1/3 right-8 text-3xl animate-gentle-float animation-delay-200">
          🎪
        </div>
        <div className="hidden sm:block absolute bottom-1/3 left-1/4 text-2xl animate-sparkle animation-delay-100">
          🌈
        </div>
        <div className="hidden sm:block absolute top-1/4 right-1/4 text-3xl animate-gentle-float animation-delay-300">
          🎨
        </div>
      </div>

      <div className="w-full max-w-sm sm:max-w-md mx-auto relative z-10 px-3 sm:px-0">
        {/* Header Section with Enhanced Design */}
        <div className="text-center mb-4 sm:mb-6 animate-fade-in">
          {/* Combined Logo Section */}
          <div className="flex justify-center items-center gap-1 mb-1 sm:mb-2">
            <img
              src="/images/Wordy Jungle Adventure Logo.png"
              alt="Wordy Jungle Adventure Logo"
              className="max-h-16 lg:max-h-24 xl:max-h-28 object-contain"
            />
            <div className="relative">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F783bb0e1cd3e4c73aa9ce79d668738ac%2Fee8d2c4de0ab40c1b0b38ee3c2ef1020?format=webp&width=800"
                alt="Wordy Kids Logo"
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain animate-gentle-float"
              />
              <div className="absolute -top-1 -right-1 bg-yellow-400 p-1 sm:p-2 rounded-full animate-bounce">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </div>
          </div>

          <p
            className="text-navy text-lg"
            style={{
              fontFamily: "Baloo 2",
              fontWeight: 500,
              fontSize: "18px",
            }}
          >
            Continue your learning journey
          </p>
        </div>

        {/* Enhanced Login Card */}
        <Card
          className="border-0 bg-white animate-fade-in animation-delay-100 mx-1 sm:mx-0"
          style={{
            borderRadius: "24px",
            padding: "32px",
            boxShadow:
              "0 12px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)",
            background: "#FFFFFF",
          }}
        >
          <CardHeader className="pb-4 px-0">
            <CardTitle
              id="login-title"
              className="text-center text-xl text-navy flex items-center justify-center gap-2"
              style={{
                fontFamily: "Baloo 2",
                fontWeight: 600,
                fontSize: "20px",
              }}
            >
              <UserCheck className="w-5 h-5 text-jungle" />
              Sign In to Continue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-0">
            <form
              onSubmit={handleLogin}
              className="space-y-3 sm:space-y-4"
              role="form"
              aria-labelledby="login-title"
            >
              {/* Email Field with Enhanced Validation */}
              <div className="space-y-1 sm:space-y-2">
                <Label
                  htmlFor="email"
                  className="text-base font-semibold text-navy flex items-center gap-2"
                  style={{ fontFamily: "Baloo 2", fontWeight: 600 }}
                >
                  <Mail className="w-4 h-4 text-navy" />
                  Parent Email Address
                </Label>
                <div className="relative">
                  <Input
                    ref={emailInputRef}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter parent email address"
                    autoComplete="email"
                    inputMode="email"
                    spellCheck={false}
                    enterKeyHint="next"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("email")}
                    onKeyDown={(e) => handleKeyDown(e, "password")}
                    disabled={isLoading}
                    className={`${getInputClassName("email")} min-h-[56px] touch-target`}
                    style={{ fontFamily: "Baloo 2" }}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    aria-invalid={!!errors.email}
                  />
                  {validationState.email === "valid" && (
                    <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                  {validationState.email === "invalid" && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
                  )}
                </div>
                {errors.email && (
                  <p
                    id="email-error"
                    className="text-sm text-red-600 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field with Enhanced Validation */}
              <div className="space-y-1 sm:space-y-2">
                <Label
                  htmlFor="password"
                  className="text-base font-semibold text-navy flex items-center gap-2"
                  style={{ fontFamily: "Baloo 2", fontWeight: 600 }}
                >
                  <Lock className="w-4 h-4 text-navy" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    enterKeyHint="done"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("password")}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleLogin(e as any)
                    }
                    disabled={isLoading}
                    className={`${getInputClassName("password")} min-h-[56px] touch-target`}
                    style={{ fontFamily: "Baloo 2" }}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    aria-invalid={!!errors.password}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    {validationState.password === "valid" && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                    {validationState.password === "invalid" && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-500 hover:text-gray-700 transition-colors ml-1 min-h-[44px] min-w-[44px] touch-target flex items-center justify-center"
                      disabled={isLoading}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    className="text-sm text-red-600 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                  disabled={isLoading}
                  className="min-h-[20px] min-w-[20px]"
                  aria-describedby="remember-description"
                />
                <Label
                  htmlFor="remember"
                  id="remember-description"
                  className="text-sm text-gray-600 cursor-pointer flex items-center gap-1 leading-relaxed"
                >
                  <Shield className="w-3 h-3 flex-shrink-0" />
                  Keep me signed in
                </Label>
              </div>

              {/* Error/Success Messages */}
              {(message || errors.general) && (
                <div
                  id="general-error"
                  className={`text-center p-3 sm:p-4 rounded-lg border transition-all duration-300 text-sm sm:text-base ${
                    message?.type === "success"
                      ? "bg-green-50 text-green-800 border-green-200"
                      : message?.type === "info"
                        ? "bg-blue-50 text-blue-800 border-blue-200"
                        : "bg-red-50 text-red-800 border-red-200"
                  }`}
                  role="alert"
                  aria-live="assertive"
                  aria-atomic="true"
                >
                  <div className="flex items-center justify-center gap-2">
                    {message?.type === "success" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : message?.type === "info" ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    {message?.text || errors.general}
                  </div>
                </div>
              )}

              {/* Enhanced Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-jungle hover:bg-jungle-dark text-white font-bold text-lg rounded-3xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-h-[56px] min-w-[200px] touch-target"
                style={{
                  boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                  fontFamily: "Baloo 2",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                }}
                aria-describedby={errors.general ? "general-error" : undefined}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing you in...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                    <Heart className="w-4 h-4" />
                  </div>
                )}
              </Button>

              {/* Enhanced Jungle-Themed Forgot Password Button */}
              <div className="text-center py-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleForgotPassword}
                  className="group px-6 py-3 bg-gradient-to-r from-jungle-light/10 to-educational-green-light/10 border-2 border-jungle/30 hover:border-jungle hover:bg-jungle/5 text-jungle hover:text-jungle-dark font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-h-[48px] min-w-[180px] touch-target"
                  style={{
                    boxShadow: "0 2px 8px rgba(76, 175, 80, 0.15)",
                    fontFamily: "Baloo 2",
                    fontWeight: 600,
                    letterSpacing: "0.3px",
                  }}
                  disabled={isLoading}
                  aria-label="Reset your password - we'll help you get back into your jungle adventure!"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg group-hover:animate-bounce">
                      🌿
                    </span>
                    <span>Forgot password?</span>
                    <span className="text-sm group-hover:animate-pulse">
                      🔑
                    </span>
                  </div>
                </Button>
                <p className="text-xs text-jungle/70 mt-1 font-medium">
                  🦋 No worries! We'll help you get back to your adventure
                </p>
              </div>

              {/* Sign Up Button */}
              <Button
                type="button"
                onClick={() => navigate("/signup")}
                className="w-full py-4 bg-sky hover:bg-sky-dark text-white font-bold text-lg rounded-3xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-h-[56px] min-w-[200px] touch-target"
                style={{
                  boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
                  fontFamily: "Baloo 2",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                }}
                disabled={isLoading}
                aria-label="Create new account"
              >
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5" />
                  <span>Create New Account</span>
                  <Sparkles className="w-4 h-4" />
                </div>
              </Button>
            </form>

            {/* Guest Sign In Button - Outside form to prevent validation */}
            <Button
              type="button"
              onClick={handleBackToMain}
              className="w-full py-4 bg-sunshine hover:bg-sunshine-dark text-navy font-bold text-lg rounded-3xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-h-[56px] min-w-[200px] touch-target"
              style={{
                boxShadow: "0 4px 12px rgba(255, 193, 7, 0.3)",
                fontFamily: "Baloo 2",
                fontWeight: 700,
                letterSpacing: "0.5px",
              }}
              disabled={isLoading}
              aria-label="Sign in as guest to explore"
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-xl animate-gentle-bounce">🎮</span>
                <span>Sign In as Guest</span>
                <span className="text-xl animate-sparkle">✨</span>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700 text-center font-medium font-['Baloo_2']">
            🔒 Secure login with encrypted password protection
          </p>
        </div>
      </div>
    </div>
  );
}
