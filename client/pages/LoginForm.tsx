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
import { useNavigate } from "react-router-dom";

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
  const emailInputRef = useRef<HTMLInputElement>(null);

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

  // Real-time email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return null;
  };

  // Real-time password validation
  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 3) return "Password must be at least 3 characters";
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

      const registeredUsers = JSON.parse(
        localStorage.getItem("wordAdventureUsers") || "[]",
      );
      const user = registeredUsers.find(
        (u: any) => u.email === email && u.password === password,
      );

      const isDemoUser =
        (email === "demo@example.com" && password === "demo123") ||
        (email === "alex@example.com" && password === "alex123") ||
        (email === "sam@example.com" && password === "sam123");

      if (user || isDemoUser) {
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        setMessage({
          type: "success",
          text: "Welcome back! Taking you to your dashboard...",
        });

        setTimeout(() => {
          navigate("/app", {
            state: {
              loginSuccess: true,
              userEmail: email,
            },
          });
        }, 1000);
      } else {
        setErrors({
          general:
            "Invalid email or password. Please check your credentials and try again.",
        });
        setMessage({
          type: "error",
          text: "Login failed. Please check your credentials.",
        });
      }
    } catch (error) {
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
    navigate("/app");
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
    const baseClass = "pr-10 transition-all duration-200";
    const state = validationState[field];

    if (state === "valid") {
      return `${baseClass} border-green-400 focus:border-green-500 focus:ring-green-500/20`;
    } else if (state === "invalid") {
      return `${baseClass} border-red-400 focus:border-red-500 focus:ring-red-500/20`;
    }
    return `${baseClass} focus:border-blue-500 focus:ring-blue-500/20`;
  };

  const isFormValid =
    !Object.keys(errors).length && formData.email && formData.password;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-2 md:p-4 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-4xl animate-gentle-float">
          ⭐
        </div>
        <div className="absolute top-20 right-16 text-3xl animate-gentle-float animation-delay-200">
          📚
        </div>
        <div className="absolute bottom-20 left-16 text-4xl animate-gentle-float animation-delay-100">
          🎯
        </div>
        <div className="absolute bottom-10 right-20 text-3xl animate-gentle-float animation-delay-300">
          🚀
        </div>
        <div className="absolute top-1/2 left-8 text-2xl animate-sparkle">
          ✨
        </div>
        <div className="absolute top-1/3 right-8 text-3xl animate-gentle-float animation-delay-200">
          🎪
        </div>
        <div className="absolute bottom-1/3 left-1/4 text-2xl animate-sparkle animation-delay-100">
          🌈
        </div>
        <div className="absolute top-1/4 right-1/4 text-3xl animate-gentle-float animation-delay-300">
          🎨
        </div>
      </div>

      <div className="w-full max-w-md mx-auto relative z-10">
        {/* Header Section with Enhanced Design */}
        <div className="text-center mb-4 md:mb-8 animate-fade-in">
          <div className="flex justify-center mb-3 md:mb-6">
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-4 md:p-6 rounded-full shadow-2xl animate-gentle-float">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F783bb0e1cd3e4c73aa9ce79d668738ac%2Fee8d2c4de0ab40c1b0b38ee3c2ef1020?format=webp&width=800"
                  alt="Wordy Logo"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div className="absolute -top-1 -right-1 bg-yellow-400 p-2 rounded-full animate-bounce">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Wordy Adventure !
          </h1>
          <p className="text-gray-600 text-lg">Continue your word adventure</p>
        </div>

        {/* Enhanced Login Card */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm animate-fade-in animation-delay-100">
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-center text-xl text-gray-800 flex items-center justify-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-500" />
              Sign In to Continue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-6">
            <form onSubmit={handleLogin} className="space-y-3 md:space-y-5">
              {/* Email Field with Enhanced Validation */}
              <div className="space-y-1 md:space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 text-gray-500" />
                  Parent Email Address
                </Label>
                <div className="relative">
                  <Input
                    ref={emailInputRef}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("email")}
                    onKeyDown={(e) => handleKeyDown(e, "password")}
                    disabled={isLoading}
                    className={getInputClassName("email")}
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
              <div className="space-y-1 md:space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-gray-500" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("password")}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleLogin(e as any)
                    }
                    disabled={isLoading}
                    className={getInputClassName("password")}
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
                      className="text-gray-500 hover:text-gray-700 transition-colors ml-1"
                      disabled={isLoading}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                  disabled={isLoading}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm text-gray-600 cursor-pointer flex items-center gap-1"
                >
                  <Shield className="w-3 h-3" />
                  Remember me on this device
                </Label>
              </div>

              {/* Error/Success Messages */}
              {(message || errors.general) && (
                <div
                  className={`text-center p-4 rounded-lg border transition-all duration-300 ${
                    message?.type === "success"
                      ? "bg-green-50 text-green-800 border-green-200"
                      : message?.type === "info"
                        ? "bg-blue-50 text-blue-800 border-blue-200"
                        : "bg-red-50 text-red-800 border-red-200"
                  }`}
                  role="alert"
                  aria-live="polite"
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
                className="w-full py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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

              {/* Forgot Password Link */}
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={handleForgotPassword}
                  className="p-0 h-auto text-xs text-gray-500 hover:text-gray-700 underline-offset-2"
                  disabled={isLoading}
                >
                  🤔 Forgot password?
                </Button>
              </div>

              {/* Sign Up Button */}
              <Button
                type="button"
                onClick={() => navigate("/signup")}
                className="w-full py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isLoading}
              >
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5" />
                  <span>Create New Account</span>
                  <Sparkles className="w-4 h-4" />
                </div>
              </Button>

              {/* Guest Sign In Button */}
              <Button
                type="button"
                onClick={handleBackToMain}
                className="w-full py-3 bg-gradient-to-r from-orange-500 via-yellow-500 to-amber-500 hover:from-orange-600 hover:via-yellow-600 hover:to-amber-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isLoading}
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xl animate-gentle-bounce">🎮</span>
                  <span>Sign In as Guest</span>
                  <span className="text-xl animate-sparkle">✨</span>
                </div>
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
