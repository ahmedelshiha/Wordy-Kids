import React from "react";
import { useNavigate } from "react-router-dom";
import { JungleWordLibrary } from "@/components/jungle";

/**
 * Demo page for the new unified Jungle Word Library
 * Features:
 * - Kid-first design with large touch targets
 * - Front-facing action buttons (Say It, Need Practice, Master It)
 * - Integrated reward system with gems and celebrations
 * - Category exploration with jungle mascots
 * - Full accessibility support
 */
export function JungleWordLibraryDemo() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/app");
  };

  return (
    <JungleWordLibrary 
      onBack={handleBack}
      initialMode="map"
      ageGroup="6-8"
      accessibilitySettings={{
        highContrast: false,
        largeText: false,
        reducedMotion: false,
        autoPlay: false,
        soundEnabled: true,
      }}
      className="min-h-screen"
    />
  );
}

export default JungleWordLibraryDemo;
