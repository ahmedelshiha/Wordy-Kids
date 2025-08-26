import React from "react";
import { DemoNavigationCard } from "./DemoNavigationCard";

export const UltimateDemoSection: React.FC = () => {
  return (
    <div className="w-full mb-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
          <span className="text-3xl animate-bounce">🚀</span>
          New Ultimate Features
          <span className="text-3xl animate-bounce animation-delay-300">
            ⭐
          </span>
        </h2>
        <p className="text-gray-600">
          Experience the most advanced word learning system ever created!
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <DemoNavigationCard />
      </div>
    </div>
  );
};
