import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { EnhancedChildLogin } from "@/components/EnhancedChildLogin";
import { AvatarCustomization } from "@/components/AvatarCustomization";
import { LevelSelection } from "@/components/LevelSelection";
import Index from "./Index";

export default function App() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [showProfileCreation, setShowProfileCreation] = useState(false);

  useEffect(() => {
    if (mode === "create") {
      setShowProfileCreation(true);
    }
  }, [mode]);

  const handleLogin = (profile: any) => {
    setCurrentProfile(profile);
    setIsLoggedIn(true);
  };

  const handleProfileCreation = (newProfile: any) => {
    setCurrentProfile(newProfile);
    setIsLoggedIn(true);
    setShowProfileCreation(false);
  };

  // If logged in, show the main app
  if (isLoggedIn && currentProfile) {
    return <Index initialProfile={currentProfile} />;
  }

  // Show profile creation if in create mode
  if (showProfileCreation || mode === "create") {
    return (
      <AvatarCustomization
        onCreateProfile={handleProfileCreation}
        onBack={() => setShowProfileCreation(false)}
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
