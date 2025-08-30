import React from "react";
import { useNavigate } from "react-router-dom";
import { JungleWordLibrary } from "@/components/JungleWordLibrary";

export function JungleWordExplorerPage() {
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
    />
  );
}

export default JungleWordExplorerPage;
