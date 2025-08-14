import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sparkles, 
  BookOpen, 
  UserPlus, 
  Users, 
  Star, 
  Play,
  Trophy,
  Target,
  Heart,
  Shield,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Enhanced entrance animation
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleNewUser = () => {
    navigate("/app?mode=create");
  };

  const handleExistingUser = () => {
    navigate("/login");
  };

  const features = [
    { icon: "🎮", text: "Fun Learning Games", color: "text-educational-green" },
    { icon: "🏆", text: "Cool Achievements", color: "text-educational-blue" },
    { icon: "🎯", text: "Personalized Learning", color: "text-educational-purple" },
    { icon: "🚀", text: "Progress Tracking", color: "text-educational-orange" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-educational-blue-light via-educational-purple-light to-educational-pink-light flex flex-col relative overflow-hidden safe-area-padding-top safe-area-padding-bottom">
      {/* Enhanced mobile background pattern */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
        <div className="absolute top-[8%] left-[8%] text-4xl md:text-6xl animate-kid-float">⭐</div>
        <div className="absolute top-[15%] right-[12%] text-3xl md:text-5xl animate-kid-float-delayed">📚</div>
        <div className="absolute bottom-[20%] left-[12%] text-4xl md:text-6xl animate-kid-float animation-delay-100">🎯</div>
        <div className="absolute bottom-[10%] right-[15%] text-3xl md:text-5xl animate-kid-float-delayed">🚀</div>
        <div className="absolute top-[45%] left-[5%] text-3xl md:text-4xl animate-sparkle">✨</div>
        <div className="absolute top-[30%] right-[5%] text-3xl md:text-4xl animate-kid-float">🎪</div>
        <div className="absolute bottom-[30%] left-[20%] text-2xl md:text-3xl animate-sparkle animation-delay-200">🌈</div>
        <div className="absolute top-[20%] right-[20%] text-3xl md:text-4xl animate-kid-float-delayed">🎨</div>
        <div className="absolute bottom-[35%] right-[8%] text-2xl md:text-3xl animate-sparkle animation-delay-100">🎭</div>
        <div className="absolute top-[60%] left-[25%] text-3xl md:text-4xl animate-kid-float">🎪</div>
      </div>

      {/* Main content container - mobile optimized */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className={`w-full max-w-4xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Enhanced mobile header */}
          <div className="mb-8 md:mb-12">
            {/* App icon with mobile optimization */}
            <div className="flex justify-center mb-6 md:mb-8">
              <div className="relative">
                <div className="bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink p-6 md:p-8 rounded-full shadow-2xl animate-gentle-float mobile-optimized">
                  <BookOpen className="w-16 h-16 md:w-20 md:h-20 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <div className="bg-educational-yellow p-2 md:p-3 rounded-full animate-gentle-bounce">
                    <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile-optimized title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink bg-clip-text text-transparent drop-shadow-sm text-mobile-friendly animate-fade-in">
              Wordy's Adventure!
            </h1>

            {/* Mobile-friendly subtitle */}
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 mb-6 md:mb-8 font-medium text-mobile-friendly animate-fade-in animation-delay-100">
              Where Learning Becomes an Adventure! ✨
            </p>

            {/* Enhanced mobile feature badges */}
            <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-3 md:gap-4 mb-8 md:mb-12 animate-fade-in animation-delay-200">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white/90 backdrop-blur-sm px-3 py-3 md:px-6 md:py-3 rounded-full shadow-lg border border-white/50 card-mobile"
                >
                  <span className={`${feature.color} font-semibold flex items-center justify-center gap-2 text-sm md:text-base`}>
                    <span className="text-lg md:text-xl">{feature.icon}</span>
                    <span className="hidden sm:inline">{feature.text}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced mobile action cards */}
          <div className="grid gap-6 md:gap-8 max-w-4xl mx-auto md:grid-cols-2">
            
            {/* New User Card - Mobile Optimized */}
            <Card
              className={`cursor-pointer transition-all duration-300 border-4 bg-white/90 backdrop-blur-sm shadow-2xl mobile-optimized touch-target ${
                hoveredCard === "new"
                  ? "scale-[1.02] md:scale-105 shadow-3xl border-educational-green/50 bg-gradient-to-br from-white to-educational-green-light/20"
                  : "hover:scale-[1.01] md:hover:scale-[1.02] border-white/50"
              }`}
              onClick={handleNewUser}
              onMouseEnter={() => setHoveredCard("new")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent className="p-6 md:p-8 lg:p-12 text-center">
                {/* Mobile-optimized icon */}
                <div className="mb-6 md:mb-8">
                  <div
                    className={`w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 mx-auto rounded-full bg-gradient-to-r from-educational-green to-educational-blue flex items-center justify-center shadow-2xl transition-all duration-300 mobile-optimized ${
                      hoveredCard === "new" ? "animate-gentle-bounce" : ""
                    }`}
                  >
                    <UserPlus className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 text-white" />
                  </div>
                </div>

                {/* Mobile-friendly title */}
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 md:mb-4 text-mobile-friendly">
                  I'm New!
                </h2>
                <p className="text-lg md:text-xl text-gray-600 mb-4 md:mb-6 leading-relaxed text-mobile-friendly">
                  Start your amazing vocabulary journey! Create your profile and begin exploring.
                </p>

                {/* Mobile-optimized features */}
                <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                  <div className="flex items-center justify-center gap-2 md:gap-3 text-educational-green text-sm md:text-base">
                    <Star className="w-4 h-4 md:w-5 md:h-5 fill-current flex-shrink-0" />
                    <span className="font-semibold">Create Your Profile</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 md:gap-3 text-educational-blue text-sm md:text-base">
                    <Heart className="w-4 h-4 md:w-5 md:h-5 fill-current flex-shrink-0" />
                    <span className="font-semibold">Choose Learning Buddy</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 md:gap-3 text-educational-purple text-sm md:text-base">
                    <Play className="w-4 h-4 md:w-5 md:h-5 fill-current flex-shrink-0" />
                    <span className="font-semibold">Start Learning Now</span>
                  </div>
                </div>

                {/* Mobile-optimized button */}
                <Button
                  className={`w-full h-12 md:h-14 text-base md:text-lg lg:text-xl font-bold bg-gradient-to-r from-educational-green to-educational-blue text-white border-0 shadow-lg transition-all duration-300 touch-target button-touch ${
                    hoveredCard === "new" ? "shadow-2xl" : ""
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 md:gap-3">
                    <span>Start My Adventure!</span>
                    <span className="text-xl md:text-2xl">🚀</span>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Existing User Card - Mobile Optimized */}
            <Card
              className={`cursor-pointer transition-all duration-300 border-4 bg-white/90 backdrop-blur-sm shadow-2xl mobile-optimized touch-target ${
                hoveredCard === "existing"
                  ? "scale-[1.02] md:scale-105 shadow-3xl border-educational-purple/50 bg-gradient-to-br from-white to-educational-purple-light/20"
                  : "hover:scale-[1.01] md:hover:scale-[1.02] border-white/50"
              }`}
              onClick={handleExistingUser}
              onMouseEnter={() => setHoveredCard("existing")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent className="p-6 md:p-8 lg:p-12 text-center">
                {/* Mobile-optimized icon */}
                <div className="mb-6 md:mb-8">
                  <div
                    className={`w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 mx-auto rounded-full bg-gradient-to-r from-educational-purple to-educational-pink flex items-center justify-center shadow-2xl transition-all duration-300 mobile-optimized ${
                      hoveredCard === "existing" ? "animate-gentle-bounce" : ""
                    }`}
                  >
                    <Users className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 text-white" />
                  </div>
                </div>

                {/* Mobile-friendly title */}
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 md:mb-4 text-mobile-friendly">
                  I Have an Account
                </h2>
                <p className="text-lg md:text-xl text-gray-600 mb-4 md:mb-6 leading-relaxed text-mobile-friendly">
                  Welcome back! Continue your vocabulary adventure where you left off.
                </p>

                {/* Mobile-optimized features */}
                <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                  <div className="flex items-center justify-center gap-2 md:gap-3 text-educational-purple text-sm md:text-base">
                    <Target className="w-4 h-4 md:w-5 md:h-5 fill-current flex-shrink-0" />
                    <span className="font-semibold">Continue Progress</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 md:gap-3 text-educational-pink text-sm md:text-base">
                    <Trophy className="w-4 h-4 md:w-5 md:h-5 fill-current flex-shrink-0" />
                    <span className="font-semibold">View Achievements</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 md:gap-3 text-educational-blue text-sm md:text-base">
                    <Zap className="w-4 h-4 md:w-5 md:h-5 fill-current flex-shrink-0" />
                    <span className="font-semibold">Keep Your Streak</span>
                  </div>
                </div>

                {/* Mobile-optimized button */}
                <Button
                  className={`w-full h-12 md:h-14 text-base md:text-lg lg:text-xl font-bold bg-gradient-to-r from-educational-purple to-educational-pink text-white border-0 shadow-lg transition-all duration-300 touch-target button-touch ${
                    hoveredCard === "existing" ? "shadow-2xl" : ""
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 md:gap-3">
                    <span>Continue Learning!</span>
                    <span className="text-xl md:text-2xl">📚</span>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced mobile footer */}
          <div className="mt-12 md:mt-16 text-center animate-fade-in animation-delay-300">
            <p className="text-base md:text-lg text-gray-600 mb-4 text-mobile-friendly">
              Join thousands of young learners on their vocabulary adventure!
            </p>
            <div className="flex justify-center items-center gap-2 text-educational-orange">
              <Shield className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-semibold text-sm md:text-base">Safe • Educational • Fun</span>
              <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            
            {/* Mobile app hint */}
            <div className="mt-6 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 mx-4 md:mx-auto md:max-w-md">
              <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                <span className="text-lg">📱</span>
                <span>Optimized for mobile learning on-the-go!</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
