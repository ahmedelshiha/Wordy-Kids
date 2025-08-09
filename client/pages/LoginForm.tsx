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
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [currentMascot, setCurrentMascot] = useState("🐙");
  const [welcomeMessage, setWelcomeMessage] = useState("Hey there, word explorer!");

  // Mascot rotation for fun
  const mascots = ["🐙", "🦄", "🐸", "🦁", "🐨", "🐧", "🦊", "🐼"];
  const welcomeMessages = [
    "Hey there, word explorer!",
    "Ready for an amazing adventure?",
    "Let's discover new words together!",
    "Welcome to the most fun learning place!",
    "Time to become a word wizard!"
  ];

  // Rotate mascot every 3 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMascot(mascots[Math.floor(Math.random() * mascots.length)]);
      setWelcomeMessage(welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
    const username = formData.username.trim();
    const password = formData.password.trim();

    // Basic validation with kid-friendly messages
    if (!username || !password) {
      setMessage({
        type: "error",
        text: "Oops! Don't forget your username and secret password! 🤗",
      });
      setIsLoading(false);
      return;
    }

    // Simulate login process (replace with real authentication)
    setTimeout(() => {
      // Demo credentials - replace with real authentication
      if (
        (username === "demo" && password === "demo123") ||
        (username === "alex" && password === "alex123") ||
        (username === "sam" && password === "sam123")
      ) {
        setMessage({
          type: "success",
          text: "Yay! Welcome back, awesome word explorer! 🎉✨",
        });

        // Navigate to main app after successful login
        setTimeout(() => {
          navigate("/app");
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: "Hmm, that doesn't look right! Let's try again, buddy! 🤗💫",
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
      text: "No worries! Ask a grown-up to help you reset your secret password! 📧🦸‍♀️",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-300 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-16 left-16 text-6xl animate-bounce delay-0 hover:scale-125 transition-transform cursor-pointer">
          🌟
        </div>
        <div className="absolute top-24 right-20 text-5xl animate-pulse delay-300 hover:scale-125 transition-transform cursor-pointer">
          📚
        </div>
        <div className="absolute bottom-24 left-20 text-6xl animate-bounce delay-600 hover:scale-125 transition-transform cursor-pointer">
          🎯
        </div>
        <div className="absolute bottom-16 right-16 text-5xl animate-pulse delay-900 hover:scale-125 transition-transform cursor-pointer">
          🚀
        </div>
        <div
          className="absolute top-1/2 left-8 text-4xl animate-spin hover:scale-125 transition-transform cursor-pointer"
          style={{ animationDuration: "4s" }}
        >
          ✨
        </div>
        <div className="absolute top-1/3 right-8 text-4xl animate-bounce delay-700 hover:scale-125 transition-transform cursor-pointer">
          🎪
        </div>
        <div className="absolute bottom-1/3 left-1/4 text-3xl animate-pulse delay-1100 hover:scale-125 transition-transform cursor-pointer">
          🌈
        </div>
        <div className="absolute top-1/4 right-1/4 text-4xl animate-bounce delay-500 hover:scale-125 transition-transform cursor-pointer">
          🎨
        </div>
        <div className="absolute top-1/3 left-1/3 text-3xl animate-pulse delay-1500 hover:scale-125 transition-transform cursor-pointer">
          🦋
        </div>
        <div className="absolute bottom-1/4 right-1/3 text-4xl animate-bounce delay-800 hover:scale-125 transition-transform cursor-pointer">
          🐝
        </div>
        <div className="absolute top-3/4 left-1/6 text-3xl animate-pulse delay-400 hover:scale-125 transition-transform cursor-pointer">
          🍀
        </div>
        <div className="absolute top-1/6 right-1/6 text-4xl animate-bounce delay-1200 hover:scale-125 transition-transform cursor-pointer">
          🎭
        </div>
      </div>

      {/* Floating Words Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-1/4 text-lg font-bold text-purple-400 opacity-30 animate-float">
          ADVENTURE
        </div>
        <div className="absolute top-1/2 right-1/4 text-lg font-bold text-pink-400 opacity-30 animate-float-delayed">
          LEARN
        </div>
        <div className="absolute bottom-32 left-1/3 text-lg font-bold text-blue-400 opacity-30 animate-float">
          EXPLORE
        </div>
        <div className="absolute top-1/4 left-1/6 text-lg font-bold text-green-400 opacity-30 animate-float-delayed">
          DISCOVER
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink p-6 rounded-full shadow-2xl">
              <BookOpen className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink bg-clip-text text-transparent mb-3">
            Welcome Back!
          </h1>
          <p className="text-xl text-gray-700 mb-6">
            Continue your word adventure! 🌟
          </p>
        </div>

        {/* Login Form */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-2 border-white/50">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-gray-800 flex items-center justify-center gap-2">
              <LogIn className="w-6 h-6 text-educational-blue" />
              Sign In to Your Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username Field */}
              <div>
                <Label
                  htmlFor="username"
                  className="text-lg font-semibold text-gray-700 flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="mt-2 text-center text-lg py-3 border-2 focus:border-educational-blue"
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div>
                <Label
                  htmlFor="password"
                  className="text-lg font-semibold text-gray-700 flex items-center gap-2"
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
                    className="text-center text-lg py-3 border-2 focus:border-educational-blue pr-12"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
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
                disabled={isLoading || !formData.username || !formData.password}
                className="w-full bg-gradient-to-r from-educational-blue to-educational-purple text-white text-lg py-4 font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </div>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In & Continue Adventure! 🚀
                  </>
                )}
              </Button>

              {/* Forgot Password */}
              <Button
                type="button"
                variant="ghost"
                onClick={handleForgotPassword}
                className="w-full text-gray-600 hover:text-educational-blue"
                disabled={isLoading}
              >
                Forgot your password? 🤔
              </Button>

              {/* Demo Info */}
              <div className="text-center bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>🎮 Demo Accounts:</strong>
                </p>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>
                    • Username: <strong>demo</strong> / Password:{" "}
                    <strong>demo123</strong>
                  </div>
                  <div>
                    • Username: <strong>alex</strong> / Password:{" "}
                    <strong>alex123</strong>
                  </div>
                  <div>
                    • Username: <strong>sam</strong> / Password:{" "}
                    <strong>sam123</strong>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center mt-8">
          <Button
            onClick={handleBackToMain}
            variant="outline"
            className="bg-white/80 backdrop-blur-sm border-white/50 text-gray-700 hover:bg-white"
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue as Guest
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <div className="flex justify-center items-center gap-2 text-gray-600">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">New to Word Adventure?</span>
            <Button
              variant="link"
              onClick={() => navigate("/app?mode=create")}
              className="text-educational-blue p-0 h-auto font-semibold"
              disabled={isLoading}
            >
              Create an account
            </Button>
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
