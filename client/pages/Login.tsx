import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, BookOpen, UserPlus, Users, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleNewUser = () => {
    navigate("/app?mode=create");
  };

  const handleExistingUser = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-educational-blue-light via-educational-purple-light to-educational-pink-light flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-6xl animate-bounce delay-0">
          ⭐
        </div>
        <div className="absolute top-20 right-16 text-5xl animate-pulse delay-200">
          📚
        </div>
        <div className="absolute bottom-20 left-16 text-6xl animate-bounce delay-500">
          🎯
        </div>
        <div className="absolute bottom-10 right-20 text-5xl animate-pulse delay-700">
          🚀
        </div>
        <div
          className="absolute top-1/2 left-8 text-4xl animate-spin"
          style={{ animationDuration: "4s" }}
        >
          ✨
        </div>
        <div className="absolute top-1/3 right-8 text-4xl animate-bounce delay-300">
          🎪
        </div>
        <div className="absolute bottom-1/3 left-1/4 text-3xl animate-pulse delay-900">
          🌈
        </div>
        <div className="absolute top-1/4 right-1/4 text-4xl animate-bounce delay-600">
          🎨
        </div>
        <div className="absolute top-3/4 left-1/3 text-3xl animate-pulse delay-1100">
          🎭
        </div>
        <div className="absolute top-1/6 left-2/3 text-4xl animate-bounce delay-400">
          🎪
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto text-center">
        {/* Header Section */}
        <div className="mb-12">
          {/* App Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink p-8 rounded-full shadow-2xl animate-pulse">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F122959266afa4d539a05a574b1531c32%2Fa3e1599156fb43479f1df1383fc15be2?format=webp&width=800"
                  alt="Wordy the Owl"
                  className="icon-xl"
                />
              </div>
              <div className="absolute -top-2 -right-2">
                <div className="bg-educational-yellow p-2 rounded-full animate-bounce">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* App Title */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink bg-clip-text text-transparent drop-shadow-sm">
            🌟 Wordy's Adventure!
          </h1>

          {/* Subtitle */}
          <p className="text-2xl md:text-3xl text-gray-700 mb-8 font-medium">
            Where Learning Becomes an Adventure! ✨
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/50">
              <span className="text-educational-green font-semibold flex items-center gap-2">
                🎮 <span>Fun Learning Games</span>
              </span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/50">
              <span className="text-educational-blue font-semibold flex items-center gap-2">
                🏆 <span>Cool Achievements</span>
              </span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/50">
              <span className="text-educational-purple font-semibold flex items-center gap-2">
                🎯 <span>Personalized Learning</span>
              </span>
            </div>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* New User Card */}
          <Card
            className={`cursor-pointer transition-all duration-300 border-4 bg-white/90 backdrop-blur-sm shadow-2xl ${
              hoveredCard === "new"
                ? "scale-105 shadow-3xl border-educational-green/50 bg-gradient-to-br from-white to-educational-green-light/20"
                : "hover:scale-102 border-white/50"
            }`}
            onClick={handleNewUser}
            onMouseEnter={() => setHoveredCard("new")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <CardContent className="p-12 text-center">
              {/* Icon */}
              <div className="mb-8">
                <div
                  className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-educational-green to-educational-blue flex items-center justify-center shadow-2xl transition-all duration-300 ${
                    hoveredCard === "new" ? "animate-bounce" : ""
                  }`}
                >
                  <UserPlus className="w-16 h-16 text-white" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                I'm New at Wordy's Adventure!
              </h2>

              {/* Description */}
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Start your amazing vocabulary journey! Create your profile,
                choose your learning buddy, and begin exploring the wonderful
                world of words.
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-center gap-3 text-educational-green">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-semibold">
                    Create Your Adventure Profile
                  </span>
                </div>
                <div className="flex items-center justify-center gap-3 text-educational-blue">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-semibold">
                    Choose Your Learning Buddy
                  </span>
                </div>
                <div className="flex items-center justify-center gap-3 text-educational-purple">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-semibold">
                    Start Learning Right Away
                  </span>
                </div>
              </div>

              {/* Button */}
              <Button
                className={`w-full py-6 text-xl font-bold bg-gradient-to-r from-educational-green to-educational-blue text-white border-0 shadow-lg transition-all duration-300 ${
                  hoveredCard === "new" ? "shadow-2xl" : ""
                }`}
                onClick={handleNewUser}
              >
                Start My Adventure! 🚀
              </Button>
            </CardContent>
          </Card>

          {/* Existing User Card */}
          <Card
            className={`cursor-pointer transition-all duration-300 border-4 bg-white/90 backdrop-blur-sm shadow-2xl ${
              hoveredCard === "existing"
                ? "scale-105 shadow-3xl border-educational-purple/50 bg-gradient-to-br from-white to-educational-purple-light/20"
                : "hover:scale-102 border-white/50"
            }`}
            onClick={handleExistingUser}
            onMouseEnter={() => setHoveredCard("existing")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <CardContent className="p-12 text-center">
              {/* Icon */}
              <div className="mb-8">
                <div
                  className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-educational-purple to-educational-pink flex items-center justify-center shadow-2xl transition-all duration-300 ${
                    hoveredCard === "existing" ? "animate-bounce" : ""
                  }`}
                >
                  <Users className="w-16 h-16 text-white" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                I Have an Account
              </h2>

              {/* Description */}
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Welcome back, word explorer! Continue your vocabulary adventure
                where you left off and discover even more amazing words.
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-center gap-3 text-educational-purple">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-semibold">Continue Your Progress</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-educational-pink">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-semibold">
                    Access Your Achievements
                  </span>
                </div>
                <div className="flex items-center justify-center gap-3 text-educational-blue">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-semibold">
                    Keep Your Learning Streak
                  </span>
                </div>
              </div>

              {/* Button */}
              <Button
                className={`w-full py-6 text-xl font-bold bg-gradient-to-r from-educational-purple to-educational-pink text-white border-0 shadow-lg transition-all duration-300 ${
                  hoveredCard === "existing" ? "shadow-2xl" : ""
                }`}
                onClick={handleExistingUser}
              >
                Continue Learning! 📚
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 mb-4">
            Join thousands of young learners on their vocabulary adventure!
          </p>
          <div className="flex justify-center items-center gap-2 text-educational-orange">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Safe • Educational • Fun</span>
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
