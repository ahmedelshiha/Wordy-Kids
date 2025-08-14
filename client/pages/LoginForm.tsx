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
  Home,
  HelpCircle,
  ChevronRight,
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
  const passwordInputRef = useRef<HTMLInputElement>(null);

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

  // Mobile-optimized focus management
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      emailInputRef.current?.focus();
    }
  }, []);

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
      setValidationState((prev) => ({ ...prev, email: "valid" }));
    }
  }, []);

  // Enhanced mobile-friendly email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (email.length > 254) return "Email too long";
    if (!emailRegex.test(email)) return "Enter a valid email";
    return null;
  };

  // Enhanced mobile-friendly password validation
  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be 8+ characters";
    if (password.length > 128) return "Password too long";
    return null;
  };

  // Update validation state with haptic-like feedback
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
    const trimmedValue = value.trimStart();

    setFormData((prev) => ({
      ...prev,
      [name]: trimmedValue,
    }));

    // Real-time validation for better UX
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

    updateValidation(name as keyof ValidationState, trimmedValue);

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

  // Mobile-optimized keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, nextField?: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextField === "password") {
        passwordInputRef.current?.focus();
      } else if (nextField === "submit") {
        handleLogin(e as any);
      }
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
        text: "Please fix the errors above",
      });
      // Focus first error field for better accessibility
      if (errors.email) {
        emailInputRef.current?.focus();
      } else if (errors.password) {
        passwordInputRef.current?.focus();
      }
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const email = formData.email.trim();
    const password = formData.password.trim();

    try {
      // Simulate API call with mobile-appropriate timing
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
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        setMessage({
          type: "success",
          text: "Welcome back! Redirecting...",
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
          general: "Invalid credentials. Please try again.",
        });
        setMessage({
          type: "error",
          text: "Login failed. Check your credentials.",
        });
        // Focus email field for retry
        emailInputRef.current?.focus();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Connection error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToMain = () => {
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
        text: `Reset link sent to ${formData.email}`,
      });
    } else {
      setMessage({
        type: "info",
        text: "Please enter your email first",
      });
      emailInputRef.current?.focus();
    }
  };

  // Enhanced mobile-friendly input styling
  const getInputClassName = (field: keyof ValidationState) => {
    const baseClass = "h-12 md:h-10 text-base md:text-sm pr-12 transition-all duration-200 touch-target mobile-optimized";
    const state = validationState[field];

    if (state === "valid") {
      return `${baseClass} border-green-400 focus:border-green-500 focus:ring-green-500/20 bg-green-50/50`;
    } else if (state === "invalid") {
      return `${baseClass} border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50`;
    }
    return `${baseClass} focus:border-blue-500 focus:ring-blue-500/20`;
  };

  // Mobile-optimized demo credentials
  const demoCredentials = [
    { email: "demo@example.com", password: "demo123", label: "Demo Account" },
    { email: "alex@example.com", password: "alex123", label: "Alex's Account" },
    { email: "sam@example.com", password: "sam123", label: "Sam's Account" },
  ];

  const fillDemoCredentials = (email: string, password: string) => {
    setFormData({ email, password });
    setValidationState({ email: "valid", password: "valid" });
    setErrors({});
    setTouched({ email: true, password: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col relative overflow-hidden safe-area-padding-top safe-area-padding-bottom">
      {/* Enhanced mobile background pattern */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
        <div className="absolute top-[10%] left-[10%] text-4xl md:text-6xl animate-gentle-float">⭐</div>
        <div className="absolute top-[20%] right-[15%] text-3xl md:text-5xl animate-gentle-float animation-delay-200">📚</div>
        <div className="absolute bottom-[25%] left-[15%] text-4xl md:text-6xl animate-gentle-float animation-delay-100">🎯</div>
        <div className="absolute bottom-[15%] right-[20%] text-3xl md:text-5xl animate-gentle-float animation-delay-300">🚀</div>
        <div className="absolute top-[45%] left-[8%] text-2xl md:text-4xl animate-sparkle">✨</div>
        <div className="absolute top-[35%] right-[8%] text-3xl md:text-4xl animate-gentle-float animation-delay-200">🎪</div>
        <div className="absolute bottom-[35%] left-[25%] text-2xl md:text-3xl animate-sparkle animation-delay-100">🌈</div>
        <div className="absolute top-[25%] right-[25%] text-3xl md:text-4xl animate-gentle-float animation-delay-300">🎨</div>
      </div>

      {/* Mobile-optimized navigation */}
      <div className="flex justify-between items-center p-4 md:p-6 relative z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToMain}
          className="touch-target haptic-light flex items-center gap-2 text-gray-600 hover:text-gray-800"
          disabled={isLoading}
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMessage({ type: "info", text: "Help coming soon!" })}
          className="touch-target haptic-light flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Help</span>
        </Button>
      </div>

      {/* Main content container - mobile optimized */}
      <div className="flex-1 flex items-center justify-center px-4 md:px-6 pb-4">
        <div className="w-full max-w-md mx-auto relative z-10">
          {/* Enhanced mobile header */}
          <div className="text-center mb-6 md:mb-8 animate-fade-in">
            <div className="flex justify-center mb-4 md:mb-6">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-4 md:p-6 rounded-full shadow-2xl animate-gentle-float mobile-optimized">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F783bb0e1cd3e4c73aa9ce79d668738ac%2Fee8d2c4de0ab40c1b0b38ee3c2ef1020?format=webp&width=800"
                    alt="Wordy Logo"
                    className="w-12 h-12 md:w-16 md:h-16 object-contain"
                  />
                </div>
                <div className="absolute -top-1 -right-1 bg-yellow-400 p-2 rounded-full animate-gentle-bounce">
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 text-mobile-friendly">
              Welcome Back!
            </h1>
            <p className="text-gray-600 text-base md:text-lg">Continue your word adventure</p>
          </div>

          {/* Enhanced mobile-optimized login card */}
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm animate-fade-in animation-delay-100 mobile-optimized">
            <CardHeader className="pb-2 md:pb-4 px-4 md:px-6">
              <CardTitle className="text-center text-lg md:text-xl text-gray-800 flex items-center justify-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-500" />
                Sign In
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4 md:space-y-6 px-4 md:px-6">
              <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
                {/* Mobile-optimized email field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      ref={emailInputRef}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      autoComplete="email"
                      inputMode="email"
                      spellCheck={false}
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
                      <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                    {validationState.email === "invalid" && (
                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                    )}
                  </div>
                  {errors.email && (
                    <p
                      id="email-error"
                      className="text-sm text-red-600 flex items-center gap-1"
                      role="alert"
                    >
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Mobile-optimized password field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4 text-gray-500" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      ref={passwordInputRef}
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur("password")}
                      onKeyDown={(e) => handleKeyDown(e, "submit")}
                      disabled={isLoading}
                      className={getInputClassName("password")}
                      aria-describedby={errors.password ? "password-error" : undefined}
                      aria-invalid={!!errors.password}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      {validationState.password === "valid" && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                      {validationState.password === "invalid" && (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-500 hover:text-gray-700 transition-colors touch-target haptic-light p-1"
                        disabled={isLoading}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.password && (
                    <p
                      id="password-error"
                      className="text-sm text-red-600 flex items-center gap-1"
                      role="alert"
                    >
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Mobile-optimized remember me */}
                <div className="flex items-center space-x-3 py-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    disabled={isLoading}
                    className="touch-target"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm text-gray-600 cursor-pointer flex items-center gap-2 touch-target"
                  >
                    <Shield className="w-3 h-3" />
                    Remember me
                  </Label>
                </div>

                {/* Enhanced mobile messages */}
                {(message || errors.general) && (
                  <div
                    className={`p-4 rounded-lg border transition-all duration-300 ${
                      message?.type === "success"
                        ? "bg-green-50 text-green-800 border-green-200"
                        : message?.type === "info"
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : "bg-red-50 text-red-800 border-red-200"
                    }`}
                    role="alert"
                    aria-live="polite"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      {message?.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span>{message?.text || errors.general}</span>
                    </div>
                  </div>
                )}

                {/* Mobile-optimized submit button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none touch-target button-touch"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <LogIn className="w-5 h-5" />
                      <span>Sign In</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>

                {/* Mobile-optimized forgot password */}
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleForgotPassword}
                    className="text-sm text-gray-500 hover:text-gray-700 underline-offset-2 touch-target"
                    disabled={isLoading}
                  >
                    Forgot password?
                  </Button>
                </div>
              </form>

              {/* Mobile-optimized demo credentials section */}
              <div className="border-t pt-4 space-y-3">
                <p className="text-xs text-gray-500 text-center">Try with demo accounts:</p>
                <div className="grid gap-2">
                  {demoCredentials.map((demo, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => fillDemoCredentials(demo.email, demo.password)}
                      disabled={isLoading}
                      className="text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors touch-target card-mobile text-sm"
                    >
                      <div className="font-medium text-gray-700">{demo.label}</div>
                      <div className="text-xs text-gray-500">{demo.email}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile-optimized action buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  type="button"
                  onClick={() => navigate("/signup")}
                  variant="outline"
                  className="w-full h-12 border-2 border-blue-200 hover:bg-blue-50 text-blue-700 font-semibold transition-all duration-300 touch-target button-touch"
                  disabled={isLoading}
                >
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5" />
                    <span>Create Account</span>
                    <Sparkles className="w-4 h-4" />
                  </div>
                </Button>

                <Button
                  type="button"
                  onClick={handleBackToMain}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 via-yellow-500 to-amber-500 hover:from-orange-600 hover:via-yellow-600 hover:to-amber-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 touch-target button-touch"
                  disabled={isLoading}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎮</span>
                    <span>Continue as Guest</span>
                    <span className="text-xl">✨</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
