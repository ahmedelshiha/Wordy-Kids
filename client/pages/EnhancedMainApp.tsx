import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBrowserBackButton } from "@/hooks/useBrowserBackButton";
import { EnhancedChildLogin } from "@/components/EnhancedChildLogin";
import { AvatarCustomization } from "@/components/AvatarCustomization";
import { LevelSelection } from "@/components/LevelSelection";
import { EnhancedWordLibraryUltimate } from "@/components/EnhancedWordLibraryUltimate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Star,
  Crown,
  Heart,
  Target,
  BookOpen,
  Brain,
  Sparkles,
  Volume2,
  Settings,
  ArrowLeft,
} from "lucide-react";

interface ProfileData {
  id: string;
  name: string;
  email?: string;
  age?: number;
  level: number;
  levelName: string;
  skillLevel: number;
  avatar: { emoji: string; name: string };
  theme: { gradient: string };
  wordsLearned: number;
  points: number;
  streak: number;
  totalQuizzes: number;
  accuracy: number;
  favoriteCategory: string;
  joinedDate: string;
  lastActive: string;
  // Ultimate features
  ultimateScore?: number;
  ultimateStreak?: number;
  masteredWords?: number;
  favoriteWords?: number;
}

export default function EnhancedMainApp() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, login, isAuthenticated, isGuest, isLoading } = useAuth();
  const mode = searchParams.get("mode");

  const [currentProfile, setCurrentProfile] = useState<ProfileData | null>(null);
  const [showProfileCreation, setShowProfileCreation] = useState(false);
  const [showLevelSelection, setShowLevelSelection] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [ultimateScore, setUltimateScore] = useState(0);
  const [ultimateStreak, setUltimateStreak] = useState(0);

  // Initialize back button handling for the app
  const { handleBack, addHistoryEntry } = useBrowserBackButton({
    fallbackRoute: "/",
    onBackAttempt: () => {
      console.log("Back button pressed in enhanced app");
    },
    customBackHandler: () => {
      if (showDashboard) {
        setShowDashboard(false);
        return true;
      }
      if (showLevelSelection) {
        setShowLevelSelection(false);
        setShowProfileCreation(true);
        return true;
      }
      if (showProfileCreation) {
        navigate("/");
        return true;
      }
      return false;
    },
  });

  useEffect(() => {
    // Auto-create a default profile and authenticate user to skip login screen
    if (!isAuthenticated && !currentProfile) {
      const defaultProfile: ProfileData = {
        id: "ultimate-user-" + Date.now(),
        name: "Ultimate Explorer",
        email: "explorer@ultimatewords.com",
        age: 8,
        level: 3,
        levelName: "Ultimate Word Master",
        skillLevel: 3,
        avatar: { emoji: "🌟", name: "Ultimate Star" },
        theme: { gradient: "from-jungle to-sunshine" },
        wordsLearned: 75,
        points: 2850,
        streak: 18,
        totalQuizzes: 12,
        accuracy: 92,
        favoriteCategory: "Ultimate Adventure",
        joinedDate: new Date().toLocaleDateString(),
        lastActive: "Today",
        ultimateScore: 0,
        ultimateStreak: 0,
        masteredWords: 0,
        favoriteWords: 0,
      };

      const userProfile = {
        id: defaultProfile.id,
        name: defaultProfile.name,
        email: defaultProfile.email,
        type: "child" as const,
        isGuest: true,
      };

      login(userProfile);
      setCurrentProfile(defaultProfile);
      addHistoryEntry();
    }

    if (isAuthenticated && user && !currentProfile) {
      const defaultProfile: ProfileData = {
        id: user.id,
        name: user.name,
        level: 3,
        levelName: "Ultimate Word Master",
        skillLevel: 3,
        avatar: { emoji: "🌟", name: "Ultimate Star" },
        theme: { gradient: "from-jungle to-sunshine" },
        wordsLearned: 75,
        points: 2850,
        streak: 18,
        totalQuizzes: 12,
        accuracy: 92,
        favoriteCategory: "Ultimate Adventure",
        joinedDate: new Date().toLocaleDateString(),
        lastActive: "Today",
        ultimateScore: 0,
        ultimateStreak: 0,
        masteredWords: 0,
        favoriteWords: 0,
      };
      setCurrentProfile(defaultProfile);
      addHistoryEntry();
    }

    if (mode === "create") {
      setShowProfileCreation(true);
    }
  }, [mode, currentProfile, isAuthenticated, user, addHistoryEntry, login]);

  const handleLogin = (profile: any) => {
    const userProfile = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      type: "child" as const,
      isGuest: false,
    };

    login(userProfile);
    setCurrentProfile(profile);
  };

  const handleProfileCreation = (newProfile: any) => {
    setCurrentProfile({
      ...newProfile,
      ultimateScore: 0,
      ultimateStreak: 0,
      masteredWords: 0,
      favoriteWords: 0,
    });
    setShowProfileCreation(false);
    setShowLevelSelection(true);
  };

  const handleLevelSelection = (level: number, levelName: string) => {
    const updatedProfile = {
      ...currentProfile!,
      level,
      levelName,
      skillLevel: level,
    };
    setCurrentProfile(updatedProfile);
    setShowLevelSelection(false);
  };

  const handleShowDashboard = () => {
    setShowDashboard(true);
  };

  const handleBackToLibrary = () => {
    setShowDashboard(false);
  };

  // Memoize callback functions to prevent infinite loops in child components
  const handleScoreUpdate = useCallback((score: number) => {
    setUltimateScore(score);
    // Update profile using functional update to avoid dependency
    setCurrentProfile(prevProfile => {
      if (prevProfile) {
        return { ...prevProfile, ultimateScore: score };
      }
      return prevProfile;
    });
  }, []); // No dependencies to prevent recreation

  const handleStreakUpdate = useCallback((streak: number) => {
    setUltimateStreak(streak);
    // Update profile using functional update to avoid dependency
    setCurrentProfile(prevProfile => {
      if (prevProfile) {
        return { ...prevProfile, ultimateStreak: streak };
      }
      return prevProfile;
    });
  }, []); // No dependencies to prevent recreation

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-jungle to-sunshine">
        <div className="text-center text-white">
          <div className="text-6xl mb-4 animate-bounce">🌟</div>
          <div className="text-2xl font-bold">Loading Ultimate Word Adventure...</div>
        </div>
      </div>
    );
  }

  // Show dashboard if requested
  if (showDashboard && isAuthenticated && currentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-jungle to-sunshine p-4">
        <div className="max-w-4xl mx-auto">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={handleBackToLibrary}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
            
            <h1 className="text-3xl font-bold text-white text-center">
              🌟 Ultimate Dashboard 🌟
            </h1>
            
            <div className="w-32" /> {/* Spacer */}
          </div>

          {/* Profile Info */}
          <Card className="mb-6 bg-white/90 backdrop-blur-sm border-2 border-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-jungle">
                <span className="text-4xl">{currentProfile.avatar.emoji}</span>
                <div>
                  <h2 className="text-2xl">{currentProfile.name}</h2>
                  <p className="text-lg text-gray-600">{currentProfile.levelName}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                  <div className="text-2xl font-bold text-yellow-800">{ultimateScore}</div>
                  <div className="text-sm text-yellow-700">Ultimate Score</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-r from-red-100 to-pink-100 rounded-lg">
                  <Star className="w-8 h-8 mx-auto mb-2 text-red-600" />
                  <div className="text-2xl font-bold text-red-800">{ultimateStreak}</div>
                  <div className="text-sm text-red-700">Ultimate Streak</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                  <Crown className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-800">{currentProfile.masteredWords || 0}</div>
                  <div className="text-sm text-green-700">Mastered Words</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg">
                  <Heart className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-purple-800">{currentProfile.favoriteWords || 0}</div>
                  <div className="text-sm text-purple-700">Favorite Words</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-jungle">
                <Target className="w-6 h-6" />
                Recent Ultimate Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Sparkles className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="font-semibold text-green-800">Ultimate Mode Activated!</div>
                    <div className="text-sm text-green-600">Discovered the enhanced learning experience</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-semibold text-blue-800">Multi-Mode Learning Unlocked</div>
                    <div className="text-sm text-blue-600">Learn, Quiz, and Memory modes available</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Volume2 className="w-6 h-6 text-purple-600" />
                  <div>
                    <div className="font-semibold text-purple-800">Enhanced Audio Active</div>
                    <div className="text-sm text-purple-600">Child-optimized TTS system ready</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If authenticated, show the enhanced word library
  if (isAuthenticated && currentProfile) {
    return (
      <div className="min-h-screen">
        <EnhancedWordLibraryUltimate
          onBack={() => navigate("/")}
          userInterests={[currentProfile.favoriteCategory.toLowerCase()]}
          enableAdvancedFeatures={true}
          showMobileOptimizations={true}
          onScoreUpdate={handleScoreUpdate}
          onStreakUpdate={handleStreakUpdate}
        />
        
        {/* Floating Dashboard Button */}
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={handleShowDashboard}
            className="bg-gradient-to-r from-jungle to-sunshine hover:from-jungle-dark hover:to-sunshine-dark text-white shadow-xl rounded-full w-14 h-14 p-0"
            title="View Ultimate Dashboard"
          >
            <Trophy className="w-6 h-6" />
          </Button>
        </div>
      </div>
    );
  }

  // Show level selection after profile creation
  if (showLevelSelection) {
    return (
      <LevelSelection
        onLevelSelect={handleLevelSelection}
        onBack={() => {
          setShowLevelSelection(false);
          setShowProfileCreation(true);
        }}
      />
    );
  }

  // Show profile creation if in create mode
  if (showProfileCreation || mode === "create") {
    return (
      <AvatarCustomization
        onCreateProfile={handleProfileCreation}
        onBack={() => navigate("/")}
      />
    );
  }

  // Show login screen for existing users
  return (
    <EnhancedChildLogin
      onLogin={handleLogin}
      onCreateProfile={() => setShowProfileCreation(true)}
    />
  );
}
