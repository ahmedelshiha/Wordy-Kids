import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  LogIn,
  Eye,
  EyeOff,
  User,
  Lock,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [owlAnimation, setOwlAnimation] = useState("animate-gentle-float");
  const [funnyMessages] = useState([
    "Hoot hoot! Let's learn together! 🦉",
    "Ready for an amazing word adventure? 🚀",
    "Wordy is excited to see you! 🎉",
    "Time to become a word wizard! ✨",
    "Let's make learning super fun! 🌟"
  ]);
  const [currentFunnyMessage, setCurrentFunnyMessage] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value.trim(),
    });
    // Clear any existing messages when user starts typing
    if (message) {
      setMessage(null);
    }
    // Add fun owl wiggle when typing
    setOwlAnimation("animate-wiggle");
    setTimeout(() => setOwlAnimation("animate-gentle-float"), 2000);
  };

  // Rotate funny messages every 3 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFunnyMessage((prev) => (prev + 1) % funnyMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [funnyMessages.length]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Trim whitespace from inputs
    const email = formData.email.trim();
    const password = formData.password.trim();

    // Basic validation
    if (!email || !password) {
      setMessage({
        type: "error",
        text: "Please enter both email and password",
      });
      setIsLoading(false);
      return;
    }

    // Simulate login process with localStorage check
    setTimeout(() => {
      // Check localStorage for registered users
      const registeredUsers = JSON.parse(
        localStorage.getItem("wordAdventureUsers") || "[]",
      );
      const user = registeredUsers.find(
        (u: any) => u.email === email && u.password === password,
      );

      // Also check demo credentials (keep username-based for demo accounts)
      const isDemoUser =
        (email === "demo@example.com" && password === "demo123") ||
        (email === "alex@example.com" && password === "alex123") ||
        (email === "sam@example.com" && password === "sam123");

      if (user || isDemoUser) {
        setMessage({
          type: "success",
          text: "Login successful! Welcome back!",
        });

        // Navigate to main app after successful login
        setTimeout(() => {
          navigate("/app");
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: "Invalid username or password. Please try again.",
        });
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleBackToMain = () => {
    navigate("/app");
  };

  const handleForgotPassword = () => {
    setMessage({
      type: "success",
      text: "Password reset instructions sent! Check your email.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4 overflow-hidden">
      {/* Fun Floating Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 text-4xl animate-kid-float">🎨</div>
        <div className="absolute top-20 right-16 text-3xl animate-kid-float-delayed animation-delay-100">🌈</div>
        <div className="absolute top-40 left-1/4 text-5xl animate-gentle-bounce">⭐</div>
        <div className="absolute top-60 right-1/3 text-4xl animate-sparkle">✨</div>
        <div className="absolute bottom-40 left-16 text-6xl animate-kid-float">🎪</div>
        <div className="absolute bottom-20 right-20 text-5xl animate-gentle-float">🎁</div>
        <div className="absolute bottom-60 left-1/3 text-4xl animate-kid-float-delayed">🦋</div>
        <div className="absolute top-1/3 left-8 text-3xl animate-wiggle">🎭</div>
        <div className="absolute top-1/2 right-8 text-4xl animate-sparkle animation-delay-200">🎪</div>
        <div className="absolute bottom-1/3 right-1/4 text-5xl animate-gentle-bounce">🎠</div>

        {/* Floating bubbles */}
        <div className="absolute top-20 left-1/2 w-8 h-8 bg-blue-300 rounded-full opacity-40 animate-kid-float"></div>
        <div className="absolute top-1/3 left-20 w-6 h-6 bg-pink-300 rounded-full opacity-40 animate-gentle-bounce"></div>
        <div className="absolute bottom-1/4 right-16 w-10 h-10 bg-yellow-300 rounded-full opacity-40 animate-sparkle"></div>
        <div className="absolute top-2/3 left-1/4 w-4 h-4 bg-purple-300 rounded-full opacity-40 animate-kid-float-delayed"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Animated Owl with Fun Border */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 p-1 rounded-full shadow-xl border-3 border-rainbow animate-pulse">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F626e97dfba5d44b5b893aa10ced647c7%2F78d82c1a7dfe42c5a8f230b46991bcb4?format=webp&width=800"
                  alt="Wordy the Owl - Educational Mascot"
                  className={`w-24 h-24 rounded-full bg-white p-1 ${owlAnimation} cursor-pointer transform hover:scale-110 transition-transform duration-300`}
                  onClick={() => {
                    setOwlAnimation("animate-wiggle");
                    setTimeout(() => setOwlAnimation("animate-gentle-float"), 2000);
                  }}
                />
              </div>
              {/* Fun sparkles around owl */}
              <div className="absolute -top-2 -right-2 text-2xl animate-sparkle">✨</div>
              <div className="absolute -bottom-2 -left-2 text-2xl animate-sparkle animation-delay-100">⭐</div>
            </div>
          </div>

          {/* Fun Title with Rainbow Effect */}
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4 animate-fade-in">
            🎉 Wordy's Super Fun Login! 🎉
          </h1>

          {/* Rotating Funny Messages */}
          <div className="h-16 flex items-center justify-center">
            <p className="text-xl font-semibold text-gray-700 animate-fade-in text-shadow">
              {funnyMessages[currentFunnyMessage]}
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-4 border-rainbow rounded-3xl transform hover:scale-105 transition-transform duration-300">
          <CardHeader className="bg-gradient-to-r from-yellow-200 to-pink-200 rounded-t-3xl">
            <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              🌟 Let's Get Started! 🌟
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-8">
              {/* Email Field */}
              <div className="relative">
                <Label
                  htmlFor="email"
                  className="text-lg font-bold text-purple-700 flex items-center gap-3 justify-center"
                >
                  <Mail className="w-6 h-6 text-pink-500" />
                  📧 Parent's Magic Email
                </Label>
                <div className="relative mt-3">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Type your super secret email here! ✨"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-14 text-center text-lg border-4 border-purple-300 focus:border-pink-500 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 font-medium placeholder:text-purple-400 focus:shadow-lg transform focus:scale-105 transition-all duration-300"
                    disabled={isLoading}
                  />
                  {formData.email && (
                    <div className="absolute -top-2 -right-2 text-2xl animate-bounce">⭐</div>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="relative">
                <Label
                  htmlFor="password"
                  className="text-lg font-bold text-purple-700 flex items-center gap-3 justify-center"
                >
                  <Lock className="w-6 h-6 text-pink-500" />
                  🔐 Secret Password
                </Label>
                <div className="relative mt-3">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Shh... enter your secret code! 🤫"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-14 text-center text-lg border-4 border-purple-300 focus:border-pink-500 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 font-medium placeholder:text-purple-400 pr-16 focus:shadow-lg transform focus:scale-105 transition-all duration-300"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-pink-500 hover:text-purple-600 hover:scale-125 transition-all duration-200"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <div className="flex items-center gap-1">
                        <EyeOff className="w-6 h-6" />
                        <span className="text-sm">🙈</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Eye className="w-6 h-6" />
                        <span className="text-sm">👁️</span>
                      </div>
                    )}
                  </button>
                  {formData.password && (
                    <div className="absolute -top-2 -right-2 text-2xl animate-bounce animation-delay-100">🎉</div>
                  )}
                </div>
              </div>

              {/* Message Display */}
              {message && (
                <div
                  className={`text-center p-4 rounded-lg ${
                    message.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {message.type === "success" ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    {message.text}
                  </div>
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading || !formData.email || !formData.password}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>

              {/* Forgot Password */}
              <Button
                type="button"
                variant="ghost"
                onClick={handleForgotPassword}
                className="w-full text-gray-600 hover:text-blue-600"
                disabled={isLoading}
              >
                Forgot your password?
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center mt-6">
          <Button
            onClick={handleBackToMain}
            variant="outline"
            className="text-gray-600 hover:text-gray-800"
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue as Guest
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <div className="flex justify-center items-center gap-2 text-gray-600">
            <span className="text-sm">Don't have an account?</span>
            <Button
              variant="link"
              onClick={() => navigate("/signup")}
              className="text-blue-600 p-0 h-auto font-semibold hover:text-blue-700"
              disabled={isLoading}
            >
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
