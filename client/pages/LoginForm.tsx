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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value.trim(),
    });
    // Clear any existing messages when user starts typing
    if (message) {
      setMessage(null);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      {/* Simple Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 text-3xl">📚</div>
        <div className="absolute top-32 right-20 text-3xl">✨</div>
        <div className="absolute bottom-20 left-20 text-3xl">🎯</div>
        <div className="absolute bottom-32 right-20 text-3xl">🌟</div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-full shadow-lg">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Welcome to Wordy's Adventure!
          </h1>
          <p className="text-lg text-gray-600">
            Sign in to continue your learning journey
          </p>
        </div>

        {/* Login Form */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border border-gray-200 rounded-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl text-gray-800">
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter parent email here"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-2 text-center border-gray-300 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div>
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="text-center border-gray-300 focus:border-blue-500 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
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
