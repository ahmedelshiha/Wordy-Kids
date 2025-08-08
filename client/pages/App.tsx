import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { EnhancedChildLogin } from "@/components/EnhancedChildLogin";
import { AvatarCustomization } from "@/components/AvatarCustomization";
import { LevelSelection } from "@/components/LevelSelection";
import Index from "./Index";

export default function App() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get("mode");
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [showProfileCreation, setShowProfileCreation] = useState(false);
  const [showLevelSelection, setShowLevelSelection] = useState(false);

  useEffect(() => {
    const authenticated = searchParams.get("authenticated");

    if (authenticated === "true") {
      // User has successfully logged in from LoginForm, create a profile and auto-login
      const defaultProfile = {
        id: "logged-in-user",
        name: "Player",
        level: 1,
        levelName: "Beginner",
        skillLevel: 1,
        avatar: { emoji: "🎯", name: "Explorer" },
        theme: { gradient: "from-purple-400 to-pink-400" },
        wordsLearned: 0,
        points: 0,
        streak: 0
      };
      setCurrentProfile(defaultProfile);
      setIsLoggedIn(true);
      // Clean up the URL by removing the authenticated parameter
      navigate("/app", { replace: true });
    } else if (mode === "create") {
      setShowProfileCreation(true);
    }
  }, [mode, searchParams, navigate]);

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
      skillLevel: level
    };
    setCurrentProfile(updatedProfile);
    setShowLevelSelection(false);
    setIsLoggedIn(true);
  };

  // If logged in, show the main app
  if (isLoggedIn && currentProfile) {
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
