import React from "react";
import { useWordCardState } from "../hooks/useWordCardState";

export function WordProgressBar() {
  const { state } = useWordCardState();
  
  const progressPercentage = (state.explorerXP % 200) / 200 * 100;

  return (
    <div className="flex justify-between items-center mb-3 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🏆</span>
        <span className="font-bold text-gray-800">{state.score} Points</span>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className="text-xs font-bold text-gray-600">
          XP: {state.explorerXP}
        </span>
      </div>
    </div>
  );
}

