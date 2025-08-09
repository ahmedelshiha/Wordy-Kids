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
            Welcome to Word Adventure
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
              {/* Username Field */}
              <div>
                <Label
                  htmlFor="username"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
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
                  className="mt-2 text-center border-gray-300 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="bg-gradient-to-r from-pink-50 to-yellow-50 p-4 rounded-2xl border-3 border-dashed border-pink-300">
                <Label
                  htmlFor="password"
                  className="text-xl font-bold text-purple-700 flex items-center gap-3 mb-3"
                >
                  <div className="bg-pink-300 p-2 rounded-full">
                    <Lock className="w-5 h-5 text-purple-700" />
                  </div>
                  🔑 What's your secret code?
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="🔐 Enter your super secret password! 🔐"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="text-center text-xl py-4 border-4 border-pink-300 focus:border-yellow-400 rounded-2xl bg-white font-bold text-purple-700 placeholder-pink-400 pr-14 transform hover:scale-105 transition-all"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-yellow-300 p-2 rounded-full hover:bg-yellow-400 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-purple-700" />
                    ) : (
                      <Eye className="w-5 h-5 text-purple-700" />
                    )}
                  </button>
                </div>
              </div>

              {/* Message Display */}
              {message && (
                <div
                  className={`text-center p-6 rounded-2xl border-4 animate-bounce ${
                    message.type === "success"
                      ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-400"
                      : "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-400"
                  }`}
                >
                  <div className="flex items-center justify-center gap-3 text-lg font-bold">
                    {message.type === "success" ? (
                      <div className="text-3xl animate-spin" style={{ animationDuration: "2s" }}>🎉</div>
                    ) : (
                      <div className="text-3xl animate-bounce">🤗</div>
                    )}
                    {message.text}
                    {message.type === "success" ? (
                      <div className="text-3xl animate-pulse">✨</div>
                    ) : (
                      <div className="text-3xl animate-bounce delay-100">💫</div>
                    )}
                  </div>
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading || !formData.username || !formData.password}
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-white text-xl py-6 font-bold rounded-2xl transform hover:scale-110 transition-all duration-300 shadow-2xl border-4 border-white"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3 text-xl">
                    <div className="text-3xl animate-spin">🌟</div>
                    Getting ready for adventure...
                    <div className="text-3xl animate-bounce">🚀</div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3 text-xl">
                    <div className="text-3xl animate-bounce">🎮</div>
                    <span>START MY ADVENTURE!</span>
                    <div className="text-3xl animate-pulse">✨</div>
                  </div>
                )}
              </Button>

              {/* Forgot Password */}
              <Button
                type="button"
                variant="ghost"
                onClick={handleForgotPassword}
                className="w-full text-purple-600 hover:text-pink-600 text-lg font-bold py-3 hover:bg-purple-50 rounded-xl"
                disabled={isLoading}
              >
                🤔 Forgot your secret code? No problem!
              </Button>

              {/* Demo Info */}
              <div className="text-center bg-gradient-to-r from-yellow-100 via-pink-100 to-purple-100 rounded-2xl p-6 border-4 border-dashed border-rainbow">
                <p className="text-lg text-purple-800 mb-4 font-bold">
                  🎮 <span className="animate-pulse">Try These Super Cool Accounts!</span> 🎮
                </p>
                <div className="text-sm text-purple-700 space-y-3 font-bold">
                  <div className="bg-white rounded-xl p-3 border-2 border-yellow-300">
                    🌟 Explorer <strong>demo</strong> with secret code <strong>demo123</strong>
                  </div>
                  <div className="bg-white rounded-xl p-3 border-2 border-pink-300">
                    🚀 Adventurer <strong>alex</strong> with secret code <strong>alex123</strong>
                  </div>
                  <div className="bg-white rounded-xl p-3 border-2 border-purple-300">
                    🎭 Hero <strong>sam</strong> with secret code <strong>sam123</strong>
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
            className="bg-gradient-to-r from-green-200 to-blue-200 border-4 border-green-400 text-green-800 font-bold py-4 px-8 rounded-2xl hover:scale-110 transform transition-all text-lg"
            disabled={isLoading}
          >
            <ArrowLeft className="w-5 h-5 mr-3" />
            🎪 Explore as Guest Adventurer! 🎪
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border-4 border-dashed border-purple-300">
            <div className="flex justify-center items-center gap-3 text-purple-700 text-lg font-bold mb-4">
              <Sparkles className="w-6 h-6 text-yellow-500 animate-spin" style={{ animationDuration: "3s" }} />
              <span className="animate-pulse">First time here?</span>
              <Sparkles className="w-6 h-6 text-pink-500 animate-spin" style={{ animationDuration: "3s" }} />
            </div>
            <Button
              onClick={() => navigate("/app?mode=create")}
              className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-500 text-white font-bold py-4 px-8 rounded-2xl text-xl hover:scale-110 transform transition-all shadow-2xl border-4 border-white"
              disabled={isLoading}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl animate-bounce">🌟</span>
                <span>CREATE MY EXPLORER PROFILE!</span>
                <span className="text-2xl animate-bounce delay-100">🚀</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
