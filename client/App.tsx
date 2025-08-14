import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { EnhancedChildLogin } from "@/components/EnhancedChildLogin";
import { AvatarCustomization } from "@/components/AvatarCustomization";
import { LevelSelection } from "@/components/LevelSelection";
import { WordLearningSessionProvider } from "@/contexts/WordLearningSessionContext";
import Index from "./pages/Index";

export default function App() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get("mode");

  const [isLoggedIn, setIsLoggedIn] = useState(true); // Auto-login enabled
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [showProfileCreation, setShowProfileCreation] = useState(false);
  const [showLevelSelection, setShowLevelSelection] = useState(false);

  useEffect(() => {
    // Always create a default profile and auto-login to the dashboard
    const defaultProfile = {
      id: "default-user",
      name: "Word Explorer",
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

    if (!currentProfile) {
      setCurrentProfile(defaultProfile);
      setIsLoggedIn(true);
    }

    if (mode === "create") {
      setShowProfileCreation(true);
    }
  }, [mode, currentProfile]);

  const handleLogin = (profile: any) => {
    setCurrentProfile(profile);
    setIsLoggedIn(true);
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

  // If logged in, show the main app
  if (isLoggedIn && currentProfile) {
    return (
      <WordLearningSessionProvider>
        <Index initialProfile={currentProfile} />
      </WordLearningSessionProvider>
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
