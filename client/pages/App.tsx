import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBrowserBackButton } from "@/hooks/useBrowserBackButton";
import { EnhancedChildLogin } from "@/components/EnhancedChildLogin";
import { AvatarCustomization } from "@/components/AvatarCustomization";
import { LevelSelection } from "@/components/LevelSelection";
import Index from "./Index";

export default function App() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, login, isAuthenticated, isGuest, isLoading } = useAuth();
  const mode = searchParams.get("mode");

  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [showProfileCreation, setShowProfileCreation] = useState(false);
  const [showLevelSelection, setShowLevelSelection] = useState(false);

  // Initialize back button handling for the app
  const { handleBack, addHistoryEntry } = useBrowserBackButton({
    fallbackRoute: "/",
    onBackAttempt: () => {
      console.log("Back button pressed in app");
    },
    customBackHandler: () => {
      // Custom back handling based on current state
      if (showLevelSelection) {
        setShowLevelSelection(false);
        setShowProfileCreation(true);
        return true; // Prevent default back behavior
      }
      if (showProfileCreation) {
        navigate("/");
        return true; // Prevent default back behavior
      }
      return false; // Allow default back behavior
    },
  });

  useEffect(() => {
    // Auto-create a default profile and authenticate user to skip login screen
    if (!isAuthenticated && !currentProfile) {
      // Create a default guest profile
      const defaultProfile = {
        id: "guest-user-" + Date.now(),
        name: "Alex",
        email: "guest@wordykids.com",
        age: 8,
        level: 3,
        levelName: "Story Builder",
        skillLevel: 3,
        avatar: { emoji: "🌟", name: "Star Learner" },
        theme: { gradient: "from-educational-blue to-educational-purple" },
        wordsLearned: 45,
        points: 1850,
        streak: 12,
        totalQuizzes: 8,
        accuracy: 87,
        favoriteCategory: "Adventure",
        joinedDate: new Date().toLocaleDateString(),
        lastActive: "Today",
      };

      // Auto-login the user
      const userProfile = {
        id: defaultProfile.id,
        name: defaultProfile.name,
        email: defaultProfile.email,
        type: "child" as const,
        isGuest: true,
      };

      login(userProfile);
      setCurrentProfile(defaultProfile);
      // Add history entry when user successfully accesses the app
      addHistoryEntry();
    }

    // Create a default profile if user is authenticated but no profile exists
    if (isAuthenticated && user && !currentProfile) {
      const defaultProfile = {
        id: user.id,
        name: user.name,
        level: 3,
        levelName: "Story Builder",
        skillLevel: 3,
        avatar: { emoji: "🌟", name: "Star Learner" },
        theme: { gradient: "from-educational-blue to-educational-purple" },
        wordsLearned: 45,
        points: 1850,
        streak: 12,
        totalQuizzes: 8,
        accuracy: 87,
        favoriteCategory: "Adventure",
        joinedDate: new Date().toLocaleDateString(),
        lastActive: "Today",
      };
      setCurrentProfile(defaultProfile);
      // Add history entry when user successfully accesses the app
      addHistoryEntry();
    }

    if (mode === "create") {
      setShowProfileCreation(true);
    }
  }, [mode, currentProfile, isAuthenticated, user, addHistoryEntry, login]);

  const handleLogin = (profile: any) => {
    // Create user profile for auth context
    const userProfile = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      type: "child" as const,
      isGuest: false,
    };

    // Login using auth context
    login(userProfile);
    setCurrentProfile(profile);
  };

  const handleProfileCreation = (newProfile: any) => {
    setCurrentProfile(newProfile);
    setShowProfileCreation(false);
    setShowLevelSelection(true);
  };

  const handleLevelSelection = (level: number, levelName: string) => {
    // Add level info to profile
    const updatedProfile = {
      ...currentProfile,
      level,
      levelName,
      skillLevel: level,
    };
    setCurrentProfile(updatedProfile);
    setShowLevelSelection(false);
    setIsLoggedIn(true);
  };

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // If authenticated, show the main app
  if (isAuthenticated && currentProfile) {
    return <Index initialProfile={currentProfile} />;
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
