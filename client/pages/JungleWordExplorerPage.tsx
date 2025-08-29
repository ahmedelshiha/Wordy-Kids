import React from "react";
import { useNavigate } from "react-router-dom";
import { JungleAdventureWordExplorer } from "@/components/JungleAdventureWordExplorer";

export function JungleWordExplorerPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/app");
  };

  return (
    <JungleAdventureWordExplorer onBack={handleBack} />
  );
}

export default JungleWordExplorerPage;
